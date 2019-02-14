+++
date = "2018-01-08T08:45:00+13:00"
draft = true
title = "Tests are alternative implementations"
tags = ["LMAX"]

+++

One of the ways of coping with the failure of a particular process in Erlang or similar actor based systems is to 
implement the logic again in a different way. When the initial version errors out, you instead run the alternative
implementation and use the results from that process.

Most other programming languages don't make this as easy as Erlang, but I think we get around this in another way - 
by writing tests. Tests are a very limited form of the same idea, since they're only valid for a subset of the 
actual algo, they're a lot easier to write - you don't have to write  complete implementation of the code you're testing.

The weaknesses of this should be obvious in comparision. We can't use the tests to recover from failure in the actual
running program. The tests only run at development time, they can't check on the results of our computations
in the running system. 

They are however, good enough.
