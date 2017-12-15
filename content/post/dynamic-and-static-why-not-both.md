+++
date = "2016-10-03T23:10:00+13:00"
draft = true
title = "Blah blah TODO:changeme"

+++

I don't think any code base that exists for profit and where correctness is
important should rely solely on a static programming language.

In any codebase where the costs of errors are high (the environment I'm in at
the moment) you will have a lot of tests, and write a lot of tests.
(And spend a lot of time fixing tests, but that's a different story.)

Often we spend more time writing tests than "business logic" (whatever that means.)
And in the cases where we don't, usually that means we don't have a solid grasp
of the problem, or haven't broken it down enough, so we're spending more time
reworking than we should be.

It's significantly easier to write tests in a dynamic language.
I find writing tests in Clojure much, much quicker and easier than I do writing
tests in Java. This is in spite of a lot of work that's been put into making
testing easier at LMAX, and making it more like a dynamic programming language
environment.

I don't have an exact comparison, I haven't (yet) written Clojure test code for
LMAX's core platform.

If correctness and performance (along any axis, i.e. memory footprint, binary size, etc) don't
matter (or don't matter that much), then you should almost always just choose a
dynamic language, at least until you start to have champagne problems.
