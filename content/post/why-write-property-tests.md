+++
date = "2017-12-23T09:00:00+13:00"
draft = true
title = "Why write property tests"

+++

Why write property based tests?

### Increase your confidence in your code

### You're lazy (and that's not a bad thing)

### Helps you find the (actual) boundaries of your system

When you first write these tests, and to be honest at this stage they don't even have to have assertions, just calling
your code and making sure it doesn't explode is enough. When it explodes on some input that you didn't count on getting,
you'll adjust the generator to not emit those values. At the same time you should step further up the stack, towards
where your customers interact with the system, and write a test to make sure that your function can't be invoked with
these values.
