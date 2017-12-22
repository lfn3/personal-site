+++
date = "2017-12-23T09:00:00+13:00"
draft = true
title = "Why write property tests"

+++

Why write property based tests?

### Increase your confidence in your code

### You're lazy (and that's not a bad thing)

I don't really love writing tests. For me they're very much a means to an end, in that they help me write code more 
correctly, faster. Unit tests, in particular, I question the lasting value of quite a bit. More often than not all
they tell you is that you changed some code. I think property tests give you more bang for you buck, since usually you
have to make the assertions general enough that they reflect the essence of the function you're testing.

### Helps you find the (actual) boundaries of your system

When you first write these tests, and to be honest at this stage they don't even have to have assertions, just calling
your code and making sure it doesn't explode is enough. When it explodes on some input that you didn't count on getting,
you'll adjust the generator to not emit those values. At the same time you should step further up the stack, towards
where your customers interact with the system, and write a test to make sure that your function can't be invoked with
these values.

### They go *great* with contracts

I'm of the opinion that one of the best things you can do to make your system more robust is adding contracts to check 
the data that flows through your code. Even if you don't enable them at runtime (or only enable them at the borders of
your system) they greatly help you confirm the consistency of your system in a way that less advanced type systems 
can otherwise struggle with. Little things like being able to say that a particular value with never be negative,
throughout your entire system are great. They let you focus on the actual problems you have to solve, rather than 
worrying about the providence of a particular bit of data.