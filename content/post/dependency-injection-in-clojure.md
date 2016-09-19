+++
date = "2016-09-19T21:57:44+12:00"
draft = false
title = "Dependency Injection in Clojure"

+++

So this is the follow up to a follow up. I've been writing Clojure more or less professionally for about a year now, and I just re-read [my old thoughts on Dependency Injection](/2015/02/15/fresh-thoughts-on-dependency-injection/). Once again, it having been more than 6 months, my opinions have changed.
The reasons I used dependency injection in C# don't affect me nearly as badly in Clojure, so the amount I use it has vastly decreased, and the way and reasons I use it have changed. 

<!--more-->

To recap the previous post, there were three main reasons I advocated using dependency injection (DI) in mainstream OO languages:

- Made it easier (or in some cases, possible) to write unit tests
- Enforced more separation of concerns in design
- Allowed development without external dependencies

The first reason is still somewhat valid in Clojure, but to a much lesser extent. The last two, not so much. There is one facet of DI that is widely used in Clojure - life-cycle management, which I will discuss at the end.

So the initial reason I adopted DI was to make it easier to write tests. I didn't realise this at the time, but this is because it introduces [seams](http://www.informit.com/articles/article.aspx?p=359417&seqNum=2) into a program. Seams are places where you can swap out behavior without affecting the rest of the program. Consciously inserting seams isn't required nearly as much in Clojure, since [`with-redefs`](https://clojuredocs.org/clojure.core/with-redefs) allows you to use every single function as a seam. Since most of your program should be functions, this makes it trivial to mock out side-effecting or non-deterministic operations. For example:

```clojure
(defn slurp-and-split [file-name]
  (->> (slurp file-name) ;Read in file as a string
       (str/split-lines)
       (map str/trim)))

(deftest slurp-and-split-splits
  (with-redefs [slurp (constantly "1
                                   2")]
    (is (= (list "1" "2") (slurp-and-split "")))))
```

As you can see using [`with-redefs`](https://clojuredocs.org/clojure.core/with-redefs) is also much, much more simple and succinct than any other mocking or stubbing library I've dealt with, but that's mostly since Clojure has stuff like [`constantly`](https://clojuredocs.org/clojure.core/constantly).

I think it's worth mentioning, I can't really see a good way of making the above function more amenable to DI. Passing in the slurp function is possible, but then I want to wrap that up inside another function in any case. If we were using a database or something similar it would make more sense:

```clojure
(defn get-user [db user-id]
  (query db "SELECT name, email FROM users WHERE id = ?" user-id))
```

But this function itself would become the target of mocking using `with-redefs`, presuming query returns a map or vector. One issue with this function is that we have to manually thread db through to the call sites. I know from experience that can be painful, it's very similar to the problems you have in OO code bases with threading values through constructors and objects that don't need them. But by using some other Clojure libraries I mention at the end, this could be rewritten to omit the `db` parameter, eliminating that issue. 

That aside, we still don't have to inject test seams, which alleviates a lot of design burden. You don't have to inflict '[test induced design damage](http://david.heinemeierhansson.com/2014/test-induced-design-damage.html)' on your code base. I used to view the hyper-abstracted, hollowed out designs that resulted from widespread use of DI as good, but now I just see this as needlessly complex. In Clojure, the simple act of extracting functions creates a lot of room for adding tests. As a functional language Clojure has great tools for putting functions together, which makes chopping up and recombining your code relatively painless, even without editor support.

This means that separation of concerns is a *lot* easier to achieve in Clojure, since it's easier to pull apart functions. Part of this is also that functions aren't coupled to the data they operate on by a class definition - you just have the arguments they're passed rather than some ambient state. You still have to be conscious of functions that involve external resources but this is the case in OO languages as well. Ideally these functions can be identified by the namespace they live in, because it has something scary like the name of a database in it.

Development without those kinds of external deps is also a lot easier. A well designed Clojure program is, again, mostly functions. And definitely the 'business logic' should be almost entirely pure functions - you should be trying to push all the side-effects to the edges of your system. So hopefully (as long as you have some sample data to work with) it should be trivial for you to try out new code in the REPL without having to rely on the presence of databases and the like.

There is one place where something of DI is still of value in Clojure, and that's when dealing with stuff that has a life-cycle. Most good DI libs [try](http://autofac.readthedocs.io/en/latest/lifetime/index.html) [to](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/beans.html#beans-factory-scopes) [deal](https://github.com/Netflix/governator/wiki/Lifecycle-Management) with this as well. Clojure has two well known solutions to life-cycle management, [Component](https://github.com/stuartsierra/component) and [Mount](https://github.com/tolitius/mount). They're both much, much more simple than the OO options, probably since they aren't [complected](https://www.infoq.com/presentations/Simple-Made-Easy) with other requirements. They don't tackle of problems that OO DI libraries have to, since many of these problems are alleviated by providing first class functions (That's an entire other post though).

Since the only problem these Clojure libraries have to solve is 'start these things' they boil down to 'tell me about all of the things'. The two libraries take very different approaches to this, Component using an API that was more familiar to me, coming from OO, while Mount's usage feels to me as if it embraces the design of Clojure more. Other people [have](https://www.reddit.com/r/Clojure/comments/41p73n/contrasting_component_and_mount/) [written](http://yogthos.net/posts/2016-01-19-ContrastingComponentAndMount.html) [more](https://github.com/tolitius/mount/blob/master/doc/differences-from-component.md) about the differences between these libraries. Personally I don't have strong opinions about which one is better (or even if one of them is better), they both solve the problem and it's great we have good options in this area.

Looping back around to our `get-user` function from the beginning, I'll demonstrate how we would eliminate the `db` parameter using mount (there's less code involved than component, so of course it's more impressive.)

```clojure
(defstate db :start (create-db-connection connection-string))

(defn get-user [user-id]
  (query db "SELECT name, email FROM users WHERE id = ?" user-id))
```

If you invoke `(mount.core/start)` somewhere near your `-main` function, this will result in the `:start` function in all the `defstate` mount can find being called (There's a bit more to it than that, of course, you'll want to see the [readme](https://github.com/tolitius/mount) to actually get started using it). 

Doing something like this does make the db related functions difficult to unit test. In my opinion, that's perfectly ok. Integration tests should be what you're using to validate your database interaction is working correctly, and they don't need to be exhaustive. Unless significant portions of your applications logic live in your database, and then I'd argue you've got a bigger problem.

I'm basically out of DI related things to talk about for now, so to wrap up: Most aspects of DI aren't amazingly useful in Clojure. It can still be used to make testing easier, but isn't really necessary. Using lots of simple functions gives you plenty of seams to exploit. Life-cycle management is still important, and Clojure has good libraries for dealing with it that are much more painless to use than the OO solutions I've seen.