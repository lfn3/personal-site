+++
date = "2016-10-03T23:10:00+13:00"
draft = false
title = "Coupling, Connascence, CSP and Actors"

+++

In the last 6 months, I've been lucky enough to be exposed to two very different ways of dealing with asynchrony in one of our production systems at [LiveOps Cloud](http://www.liveopscloud.com/). We converted one of our core backend services from Clojure's [core.async](https://github.com/clojure/core.async) to [Pulsar](http://docs.paralleluniverse.co/pulsar/). Having been a part of that transformation, I now, of course, have _opinions_ that I'm going to subject you to. Those opinions boil down to CSP ([Communicating Sequential Processes](https://en.wikipedia.org/wiki/Communicating_sequential_processes)) as implemented in core.async is better than the actor model, at least as implemented in Pulsar.

<!--more-->

A crash course on Connascence
-----------------------------

First of all, a little description about what connascence is, since as far as I know it's a relatively uncommon term. It's used to describe the degree of dependency between components in a OO (object oriented) system. Two components are connascent if a change to one would require a change to another. We can also talk about the strength of a connascence, where stronger connascences imply the change is more difficult to apply. There is more detail on [wikipedia](https://en.wikipedia.org/wiki/Connascence), which I recommend you read if you want to follow along. 

I'll give an example of two connascences first, however:

```clojure
(defn validate [data]
  (and (= (:type data) :person)
       (:name data)
       (:age data)))

(defn has-parent? [data]
  (and (:name data)
       (:parent data)
       (= (:type data) :person)))
```

This code is intentionally pretty bad, but you can imagine the case where this might be spread over multiple code bases somehow. We can describe how bad it is as a connascence of algorithm: both `validate` and `has-parent?` depend on similar logic. This can be relatively trivially fixed:

```clojure
(defn is-person? [data]
  (and (= (:type data) :person)
       (:name data)))

(defn validate [data]
  (and (is-person? data)
       (:age data)))

(defn has-parent? [data]
  (and (is-person? data)
       (:parent data))
```

We've reduced what was previously a connascence of algorithm to a connascence of name - they both depend on the same extracted function. Hopefully it makes sense that we prefer weaker forms of connascence, and less of it where possible.

Actors vs CSP
-------------

I've got a few reasons for preferring CSP style to actor style. One of the big ones is that actors have introduced pervasive, name based dependencies throughout our code base, via the actor registry mechanism. Normally connascence of name isn't really a problem, but I would argue in the case of actors it is, since these names are both common and smeared across the code base. This also introduces a dependence on the actor registry itself.

This means that our registry is global state, that all our actors depend on - a connascence of identity. I don't think this is necessarily a bad thing, after all a database is a giant blob of global state, and 'using a database' has been a pervasive and effective idea in software engineering. The problem here is the semantics of the 'database'. Actor registries intentionally prevent registering multiple actors under the same name. This isn't a bad thing, until you want to write tests using actors, since you now have to write setup and tear down code for each test. This is not a fun experience.

The mechanism of communication in core.async is the channel, which doesn't have the same global scope as an actor registration (you can of course make them have global scope, but I'll talk about that a bit later). You don't even have to close channels once you've completed your tests, as typically go blocks won't continue executing without you placing additional work on the channel that has now fallen out of scope. Of course some memory will be consumed by the parked blocks, but usually this isn't a problem.

Another issue that arises during testing is the promiscuous communication that happens between actors. Since any actor can invoke behaviour on another just by looking it up in the registry and sending it a message, you typically have to do a lot of actor mocking. This is that connascence of name again. Macros can help with the mocking, but it's still a lot more verbose than supplying channels to a function and pulling or pushing results to them. You could claim that it's easier for actors to communicate actors when you don't have to pass around channels, however if you *really* want to (and it's not something I'd normally recommend) you can simply place a channel in a `def` or even a derefable data structure (probably an `atom` or a `promise`) and get access to it where you need, but with a clearer link between it and it's producers or consumers.

This is a recurring pattern I've found - it's a lot easier to implement actor's functionality with core.async than the other way around. For instance a registry can be easily implemented with `compare-and-swap!` on a global atom containing a map. You can express a more options here when you encounter an existing registration, such as transparently using the one in place, replacing it, or going the Pulsar route of throwing an exception. The important thing here is that you have a choice about it. For a case of a feature that's more difficult to implement in Pulsar, there is customized queues. In Pulsar you have to implement an entire Actor, and some sort of feedback mechanism from consumer to queue (coupling the consumer to it's queue), otherwise it will just saturate the consumer's mailbox, rather than retaining the items in the queue. In core.async, all one has to do is reify the take and put protocols, which can be done trivially by closing over a channel or two. This queue can be used anywhere, rather than just where a consumer is designed for it.

There are stylistic differences, inherited from the linage of these two systems that introduce their own connascences. Pulsar of course follows the example of Erlang, a language where pattern matching on tuples is pervasive. While potentially powerful, it introduces a reliance on the ordering of parameters that is a stronger connascence than the idiomatic way of conveying data in Clojure. Normally if you want to pass a message around in Clojure, you will use a map, where lookup is done by name rather than by position. This isn't a hard or fast rule, and it's not normally something that really concerns me to be honest. Again, normally a connascence of position isn't a big deal - every function call has it to some degree, but the fact it exists among supposedly decoupled actors is what I find troubling.

Too many masks
--------------

On the topic of coupling, there is the actor itself. Personally I think actors have conflated several different concepts together, state being the most egregious one. Which of course I would say, being a Clojure programmer. What I mean by that is that whenever you're working with actors, state is right there, ready for you to reach out and grab it. One thing that makes me very happy about Clojure is that you have to jump through a few hoops to get mutability, and in doing so, you have to think about it. Being forced to have that moment is a good thing. 

What else is in an actor? A queue, in the form of a mailbox. Actor systems are designed to be 'fire and forget'. This is great in terms of decoupling, at least for the senders. Pulsars implementation, however, is a little less inspiring. In some trials, we've had messages in a mailbox disappear. There's also the problem of dead actors disappearing from the registry. Since looking up an actor is a blocking operation, in practice it isn't actually fire and forget. Contrast this with core.async, where a 'actor' (go-loop) and it's channels are distinct entities. At most, you'll be able to disappear the item a go-loop is currently processing if you manage to blow it up.

Another property that actors provide is fault isolation. This isn't a feature that's missing from other programming languages. The difference in actor based systems is it's pervasive nature - you can't not have it. That is definitely a good thing. Actors aren't the only way to get it, of course - Java threads and core.async go blocks are both perfectly capable of exploding without affecting things around them, but you have to choose to apply these, rather than getting it by default. I would say that this and the final property are the two important parts of actors, and they are cohesive, rather than coupled.

So finally, there's the ability to supervise other actors. I would argue this is probably the most useful part of the actor model, the firm separation of the 'happy path' from the sad path, allowing us to write our "business logic" without a care (or try-catch) in the world. This is the one aspect of actor systems I think should be exported to the wider programming world. At least in Clojure, it has been, in the form of [dire](https://github.com/MichaelDrogalis/dire). There's some blog posts linked there that explain better than I can why this is such a good thing. Between this and go blocks, I would argue that CSP can provide the most important benefits of actor systems, without what I view as the costs.

That is not to say I'm going to give up entirely on actors, however. I would like to take a closer look at Erlang or Elixir, and I'm quite interested in what the Elixir community produces in terms of patterns and architecture. The pure and ideal form of actors is appealing, and certainly offers a more perfect model than other OO languages. That said, we probably will not be using Pulsar again, or attempting to port another system. Most of the benefit we gained was in terms of a cleaner code base, which I would argue was in spite of Pulsar, rather than due to it. A concerted clean up effort could have had much the same effect as the rewrite we attempted, taken less time, and delivered more value. Next time we'll just have to do it in Elixir.