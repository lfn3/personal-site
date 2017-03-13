+++
date = "2016-06-21T17:26:00+12:00"
draft = true
title = "CSP vs Actors"

+++

This post could also be called core.async vs Pulsar, since it's mostly influenced by my dealings with those two libraries. Calling Pulsar a library might be a stretch though, as it tends to exert a lot more influence over your code than a library should. Before I start my unrelenting whinging though, why are we using Pulsar in the first place?

At my employer [LiveOps Cloud](http://www.liveopscloud.com/) we picked up Pulsar a while ago for the system that drives our call flows. (You know, stuff like 'Press 1 for accounts...') The team that I work on is responsible for stuff downstream of that, in what's called the work manager. We get calls out of the hold queue, and into the hands (or headset) of someone who can help with whatever the call is about. Pulsar had worked well for the flow team, and a few of us in NZ had become interested in the promises of easier ways of dealing with failure that systems like Erlang apparently provided.

So we decided to try and change a system that previously was largely using core.async, into one that largely uses Pulsar. The core.async version had grown somewhat gnarly, with some pretty monstorous functions, so we saw this as a chance to clean house a little, as well as hopefully make our system a more robust.

We did achieve both goals to a degree, but I would argue that in both cases it was more in spite of Pulsar rather than due to it. First I'm going to write a little about what we thought Pulsar and the actor model in general would offer us and contrast that with core.async, and that's going to gradually slide into Pulsar specific issues.

Dealing with failure
--------------------

Actors claim to provide fault isolation. I would argue that core.async does that just as well (though the behaviour is suprising the first time around.) and lets you deal better with the aftermath of failure than actors. Channels aren't as coupled to a go block as an actor is to it's mailbox. (at least in Pulsar, something like orleans or orbit provides nicer guarantees around message sends/reciepts.) This is great. It lets you deal with failure in a go block without (necessarily) affecting upstream writers until necessary.

You could use a similar pattern in Pulsar by creating a queue actor to sit between your 'actual' actors. This isn't something we've done, instead we're mostly relying on our actors being alive more often than not. I'm not really sure how good of an idea this is in practice. We haven't yet spent enough time with the system in production for me to be confident about this choice.

The actor model does have one potential strength in the ability to supervise processes, which is what we want to rely on for the 'keeping actors mostly alive' bit. This is somewhat possible in core.async by pulling from the channel that starting a go block returns. You can use this to construct a supervisor that watches many child go blocks or loops using `alts!`. In practice this wasn't something we chose to do, we used to entirely deal with errors at a go block level. One case where it might be useful is when there are persistent failures of a process, and this begins backing up the rest of the system.

This is certainly a topic you can get further into, and one of my colleagues, Angus, has been writing a bit about it on his blog [here](http://blog.goose.haus/2016/04/04/producers-and-error-handling.html).

Pulsar problems
---------------

Unfortunately we've had serious issues in getting some of Pulsars behaviours (essentially equivalent to OTPs behaviours) working together with supervision. This has been a recurring theme with Pulsar, where some parts of don't really behave the way we expected them to. Most of these issues have been around supervision which is unfortunate since that's a large part of why we choose an actor system like Pulsar.

Another issue we've had with Pulsar is having to synchronize access via a supervising actor to a bunch of child actors so that we can start them if they're either not started or not alive when we try to pass a message to them. With regular clojure this is a lot easier. You can put a map of channels in an atom, and use `compare-and-set!` to safely create a new channel and backing go-loop without co-ordination. Again, something like Orleans or Orbit's virtual actors is a lot nicer in this regard, although as far as I know both of these systems come with the caveat that you have to implement eventually consistent semantics for their actor state, since multiple actors can be alive at any one point.

One thing that concerns me about Pulsar is that I don't have a good idea of when actors are eligible to be suspended. It's a lot more obvious when a core.async go block is going to (possibly) pause than to establish when a Pulsar actor can be stopped, especially when you're using automatic instrumentation via the java agent. (This also causes a whole bunch of logging garbage to be emitted on startup) This is something that hasn't bitten us yet, but we're not yet pushing our systems near their limits, as far as we can tell.

My last concrete gripe is around the amount of code the Pulsar makes me write. In order to make an actor seem 'clojure-y' (and apparently this is the thing you do in Erlang as well) you have to wrap all the messages you pass to it in functions, so that your non-actor code won't have to deal with how exactly to pass a message or get a response from your actors. And you'll always have some non-actorized code, since there isn't a http server implemented in Pulsar, nor would I necessarily trust it even if there was.

The final thing I want to discuss, and probably the most important (in my opinion) is about community. There doesn't seem to be a lot of use of Pulsar outside of it's creators [Parallel Universe](!!!!TODO!!!!). There's possibly a large erlang and elixir community worldwide, but we haven't really found a lot of information about how to build and structure complex systems with the actor model. Admittedly we didn't really have a great idea of how to structure systems with Clojure before we began using it either, but I would argue that systems composed largely of functions acting on small amounts of state are easier to reason about than the much more 'spread out' designs that Pulsar has thus far pushed us torwards. And Clojure has been easier to pick up as a result of there being people more visible to us talking about how to build and design systems. Perhaps we just need to watch more erlang conference talks, but then there's the overhead of translating the concepts (and maybe even the libraries) over to Clojure and Pulsar's way of doing things. 

At this point because of the issues we've had, our team isn't going to be using Pulsar for anything new, or attempt another retrofit like this. While it's possible we could overcome the issues we've encountered we have already spent more time finding and fighting idosyncronicites in Pulsar than it's bought us in terms of reducing code complexity or making anything easier to understand. I still want to figure out how to design and build actor systems, but that will probably become a problem for another day, or another employer.