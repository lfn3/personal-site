+++
date = "2017-12-22T17:00:00+13:00"
draft = true
title = "Property testing for performance"
tags = ["LMAX"]

+++

For most software systems, a significant part of their performance characteristics are defined
by the uncommon cases, rather than the common ones. A lot of engineers have spent a lot of time
exhorting us not to focus on averages but rather on high percentiles, since in the large, our
users will experience those uncommon cases relatively often.

### What makes a good performance test?

The test should be realistic - i.e. map to the ways that real users will use the system.
There's not much point in writing a performance test that doesn't stress the system in the way it's actually used.
This is a pitfall that's pretty easy to fall into, since it's easier to just create a single account and abuse that.

One point that I should mention here is the difference between a benchmark and a performance test. A benchmark is all
about isolating a particular piece of code and figuring out the performance of that little slice of code.
These can be very useful, but they're something like the unit test of performance - at most they can tell you that you
haven't damaged the performance of this little bit of the codebase. 

The best use of a benchmark is when you're going to be refactoring a particular piece of code to improve it's 
performance. 

So does a generative test tell you anything about the actual performance of the system?
Probably not. What it will do is help you find out where the worst performing parts of the system are, when exposed to
unusual or outsized inputs.
This can be invaluable at helping you weed out the "long tail" of latency spikes (or errors) before they happen.

### How do we actually do this?

It's pretty simple. I'm going to focus on how to do it with my favourite generative testing library, 
[undertaker](https://github.com/lfn3/undertaker).
What we want to do is write a bunch of property tests. These can be acceptance style tests that run over your apis, 
or integration test that cover a smaller portion of your code. The key part of this is that they have to be running 
against a since instance of your system, it won't do you much good if you target 

What do we expect to happen as we run these tests? If your system hangs onto any kind of state, we should see the tests
gradually get slower and slower, simply because anything that has to operate on a collection should see those 
collections grow in size over the lifetime of our test run. 

![ideal graph of time a test takes to run vs. number of tests run](/img/posts/prop-testing-for-perf/graph-ideal.jpeg)
![real(ish) graph of time a test takes to run vs. number of tests run](/img/posts/prop-testing-for-perf/graph-real.jpeg)
