+++
date = "2016-08-30T21:57:44+12:00"
draft = true
title = "Dependency Injection in Clojure"

+++

So this is the follow up to a follow up. I've been writing Clojure more or less professionally for about a year now, and I just re-read [this](http://lfn3.net/2015/02/15/fresh-thoughts-on-dependency-injection/). Once again, it having been more than 6 months, my opinions have changed.
The reasons I used dependency injection in C# don't affect me nearly as badly in Clojure, so the amount I use it has vastly decreased, and the way I use it has changed. 

<!--more-->

To recap the previous post, there were three main reasons I liked using dependency injection (DI):

- Made it easier (or in some cases, possible) to write unit tests
- Enforced cleaner separation of concerns in design
- Allowed development without external dependencies

The first reason - making it possible to write tests - is still valid in Clojure. The other two? Not so much. 

Separation of concerns is a *lot* easier to achieve in Clojure (I suspect also in any other functional programming language), since functions aren't coupled to the data they operate on by a class definition. Places where you interact with the database or the outside world (i.e. state) tend to be in their own namespaces. 

Development without external deps is guaranteed by the fact you're using a repl.

Finally the testing thing. If you're writing stuff a with a bit of caution, and not leaking database stuff outside of your db namespace, you can use `with-redefs` to replace the results of calling something stateful like `(get-user-from-db-by-id 123)` with `(constantly {:username "johnny"})`. `with-redefs` is stupidly good compared to how I used to have to mock out functions.