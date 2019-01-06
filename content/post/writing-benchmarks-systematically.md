+++
date = "2018-11-19T18:32:40+00:00"
draft = true
title = "Writing benchmarks systematically"
+++

I've spent some time lately writing benchmarks, and as part of that I've been reflecting on and
refining the process I use to produce them. I think I'm happy with it, so I thought it'd be worth
sharing. Fortunately, it's not that complicated:

1) Why are we going to write this benchmark?
2) What are we going to compare results of this benchmark to?
3) What are we trying to measure?
4) How are we going to measure it?
5) What do we expect the results to look like?
6) Write the benchmark.
7) Do the results conform to our expectations?

Obviously there's a bit more buried in these one liners, so lets dig in.

<!--more-->

### Why are we going to write this benchmark?

This is probably the most important question, especially you might save a bunch of time
by asking it! If you can't come up with a satisfactory response to this question, 
your time might be better spent elsewhere.

I think I've managed to distill down the reasons to write a benchmark. 
Either it's to tell you which code to use and which to throw away, 
or to help you find the bit of code most in need of attention. 
It can be both - a benchmark regression in CI will tell you either you need
to revert that last change (throwing it away) or tune what you just committed some more.

Another way you can use benchmarks is to bisect a performance problem.
If calling the function A takes 100ms, and it's got calls to functions B and C inside it,
we might want to benchmark those to see what percentage of that 100ms they take up.
Again, this is a way of focusing our attention on code that has the most impact on performance.

There's one other reason that's motivated me to write benchmarks lately: curiosity.
Benchmarks are a great way to help you dig in and understand how your language and platform
of choice work, and to 

### What are we comparing the results of this benchmark to?

It's probably be the same benchmark run against a different implementation, 
or it might be a concrete number coming from outside the development team.

In any case, this tells us something important about the results of a benchmark.
They're only useful if you have something to compare them to. Which makes sense, since 
"faster" and "slower" are relative measures. 

Make sure you know what you're going to compare the results of your benchmark to before you start writing it.

### What are we trying to measure?

I think you should actually write this down, preferably in the benchmark itself as a docstring.
It doesn't guarantee that someone won't come along later and change the benchmark to do something
else, or change the code underneath it to do something different, but it'll at least signpost the
original intent of the benchmark.

It should be heavily informed by the answer to the above question. 

When you say what you're trying to measure you should not just be thinking about the bit of code
you're looking at, but also the context in which it is run. At this stage you should mostly be
thinking about if you want to measure throughput or time taken. Sometimes (often, in the case of 
micro-benchmarks) one benchmark can measure both of these. As you get closer to benchmarks
covering user visible performance characteristics, you will probably have to chose between
the two.

### How are we going to measure it?

A big question here is scope. It's much easier to write smaller benchmarks, as you start
to bring more and more of an application or service into your benchmark it can get harder
and harder to set up a realistic harness for running your benchmark.

It's definitely easier to write a benchmark that only uses a single account, but you can guarantee 
that your production systems will not operate that way. Writing the easy benchmark will tell you something, 
but it may also mislead you as to the actual causes of your problems and lead to you focusing effort on 
an area that has low relative payoff.

We've made this exact mistake at [LMAX Exchange](https://www.lmax.com/). When we realised
we'd made it (because tightly scoped benchmarks didn't agree with our "full up" performance testing
environment) we got a few very fruitful commits consisting of doing a lookup in a map once,
then passing the value down, rather than looking it up again.

So you have to make the decision of how much you're going to try to measure in this benchmark.
It might be possible for you to cover a whole "slice" of your application, from deserialization 
and doing the work right and serialising the response, but it'll be quite a bit more work on your 
part, and potentially more prone to error.

Of course you can write many smaller benchmarks, but you risk leaving gaps between benchmarks, where
performance traps can lie in wait for your production workloads.

### What do we expect the results to look like?

This is mostly important so as you can use them to do a quick sanity check on the benchmark once it's run.


If this sanity check confirms your guess, it doesn't necessarily mean that the benchmark is measuring
what you think it is, however.

### Write the benchmark

There's only a few bits of guidance I can offer here - I don't know what kind of environment
(or even language) you're working with.

The most important part is probably to make good use of the `setup` phase of your benchmarking
library of choice. You should get all the data you need organized well in advance, so that 
the benchmark itself is mostly doing what you're actually trying to benchmark.

If your benchmarking tool supports it, you should try to parameterize your benchmark such that
it can be run several times in a loop, controlled by a variable. This is so you can check an
optimization pass hasn't decided some crucial part (or even all) of your benchmark is unused, 
and can be safely elided.

### Do the results conform to our expectations?

This is possibly the most important step - have we actually done what we set out to?
There's lots of failure modes we want to rule out:
Is what we're trying to measure is overwhelmed by  "background noise". 


