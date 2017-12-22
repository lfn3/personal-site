+++
date = "2017-12-23T12:26:00+13:00"
draft = true
title = "Contracts"

+++

tl;dr, [Clojure spec] has completely sold me on the value of contracts, and especially contracts that are attached to 
data. We should be writing and using more tools like spec.

### What's so special about spec?

A lot of languages have mechanisms for assertions, in one form or another. For example Java has `assert`.
Even if they don't often it's not too hard to use the error handling mechanics of the language to roll your own.
Type systems are similarly pervasive in the programming world. Outside of niche languages like [Shen]() and [Idris]()
we don't have examples of the fusion of these. And of course, there's Clojure spec, where a language without a type 
system has (I think) relatively effectively bolted something close to the advanced type system of one of these
languages on.

The thing that most appeals to me about spec is that you don't have a parallel language that you write you assertions 
about the shape of your data in. The signature for a function is plain old Clojure functions when you boil away the
spec dsl. 