+++
date = "2017-12-23T10:30:00+13:00"
draft = true
title = "Testing in the gaps"

+++

At [LMAX](https://www.lmax.com/) we've got a lot of tests, and these can take quite a long time to run. We also have 
some pretty well defined interfaces between different parts of our code. I think we might be able to make our tests run
faster (or because our tests run faster, run more tests) by instrumenting replaying the events that pass between these
systems, rather than running the test whole-cloth.

<!-- more -->

This is just an idea at this stage, rather than something I've been able to implement. It's come out of my work on 
[undertaker](https://github.com/lfn3/undertaker) which does something similar on a smaller scale by saving the output
of failing tests for later reuse. 

### How would this work?

All of our services communicate with the outside world via gateways, which host various kinds of APIs - HTTP, FIX, ITCH
etc. Rather than actually sending the messages from those gateways back to running services, we can check if we've seen
that message before, then replay back the sequence of events that followed it. If we haven't seen it before, or the 
interface between the gateway and the backing service has changed, then we have to play the message into the backing 
services, and record the responses.

### What does this enable?

You get a corpus of test inputs and expected outputs that you can use at *much* lower cost than rerunning the whole test
suite. It's possible for you to run the "acceptance" suite against a service that you've changed locally 

### By analogy

You can think of this as very similar to the way that build tools like [Buck](https://buckbuild.com/) and 
[Bazel](https://bazel.build/) work. Rather than rebuilding everything when you change a piece of code, you just have to
rebuild that module and any modules that depend on it. Similarly, changing a service doesn't mean you need to retest
every other service, unless the messages passed to those other services have changed as a result.