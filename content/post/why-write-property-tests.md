+++
date = "2017-12-23T09:00:00+13:00"
draft = true
title = "Why write property tests"

+++

Just in case you're not sure what a property based test is, it's a test where rather than specifying the input and 
output, e.g. `1 + 1 = 2`, instead get the computer to generate the input for you, and validate a more abstract property 
of the thing that you're testing. For example: `x < x + y`. They're also known as generative tests. 

Hopefully that shows they're a little more complicated to write (the above example isn't even correct unless we ignore
negative numbers), but I'm going to spend the rest of this post explaining why I think they're worth writing despite the
extra effort you have to put in.

<!-- more -->

### Increase your confidence in your code

One of the things I've learned over the few years I've spent programming is that I'm wrong *a lot*. Sometimes in obvious
ways that a compiler will catch and tell me about nearly instantly, other times in ways that I have to go and dig at or
write tests to figure out. Even when I write tests to cover whatever code I just came up with, I'm never actually sure
that I've written all of the tests I need to. Property based tests go some way towards alleviating this fear, since I 
no longer have to worry about covering every individual case, but rather just each class of test.

That's not to say you shouldn't write example based tests. If you don't write a least a couple of example based tests 
you won't be certain that the code you've written actually does what you expect it to, unless you can encode the logic
you're testing in a different way, or you have an oracle of some kind to check against in your property test.

### You're lazy (and that's not a bad thing)

I don't really love writing tests. For me they're very much a means to an end, in that they help me write code more 
correctly, faster. Unit tests, in particular, I question the lasting value of quite a bit. More often than not all
they tell you is that you changed some code. I think property tests give you more bang for you buck, since usually you
have to make the assertions general enough that they reflect the essence of the function you're testing.

I'm also a big fan of making the computer do as much work as possible or at least practical. If you use a good property
testing library, it'll automatically pick out commonly problematic test cases, e.g. -1 and 0 if you're using numbers,
or "" and "í" for strings. It should also hit the edges of any boundaries you specify fairly quickly, so if you request
a number in the range 25 - 75, you should see the library emit the values 25 and 75 during any given test run. This 
means you don't need to worry about the boundary conditions, since they'll already be covered.

### They go *great* with contracts

I'm of the opinion that one of the best things you can do to make your system more robust is adding contracts to check 
the data that flows through your code. Even if you don't enable them at runtime (or only enable them at the borders of
your system) they greatly help you confirm the consistency of your system in a way that less advanced type systems 
can otherwise struggle with. Little things like being able to say that a particular value with never be negative,
throughout your entire system are great. They let you focus on the actual problems you have to solve, rather than 
worrying about the providence of a particular bit of data.

If you then write some simple generative tests at the borders of your system (again, they don't have to assert anything,
apart from the fact they don't get an error as their response) you can be relatively certain that you don't violate the
constraints you've specified inside your codebase. 

### Helps you find the (actual) boundaries of your system

When you first write property tests, and to be honest at this stage they don't even have to have assertions, just 
calling your code and making sure it doesn't explode is enough. When it explodes on some input that you didn't count on 
getting, you'll adjust the generator to not emit those values. At the same time you should step further up the stack, 
towards where your customers interact with the system, and write a test to make sure that your function can't be invoked 
with these values.

This isn't actually much different from the point above about contracts, it's just that the contracts here are implicit 
rather than explicit.

### They're more challenging to write

This is the reason I got into programming. Sometimes it's *hard*. That's great, one of my favourite things is learning 
something new, or figuring out how to pull some code apart and put it back together better than it started out. 
As I said earlier, these kinds of tests are definitely harder to write than example based tests. I think that's a good 
thing. If you're not copy-pasting tests and tweaking them, but rather thinking about what you actually need to the code
to do and what the outwardly visible effects are, it keeps me a lot more engaged with what I'm doing than I might
otherwise be.

### Make impossible (or at least impractical) tests, possible.

Would you write a test that performs 17 different sequenced actions? Probably not unless you already knew there was a 
bug there, right? If you dive into writing stateful tests, you won't have to write the 17 action test, your property 
testing library will do it for you. In systems where correctness is important and there's lots of state to cover this
is one of the only ways to get this sort of coverage, short of using production workloads.

### tl;dr

Property based tests are harder to write than unit tests. I don't think this is a bad thing, since it actually makes the
whole testing process more interesting, at least to me. They give you confidence in your code that regular unit testing
can't give you, by exploring more states than is practical with example based tests.