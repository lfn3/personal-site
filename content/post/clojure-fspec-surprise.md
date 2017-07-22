+++
date = "2017-07-22T23:03:00+13:00"
draft = false
title = "Clojure fspec surprise"

+++

Recently when writing Clojure I've been trying to cover everything I can in specs.
This led me to a bit of a surprise when I used
[`fspec`](https://clojure.org/guides/spec#_higher_order_functions).
It evaluates the fspec'd function when it's passed to a fdef'd function,
not when you invoke the function. That's probably super unclear, so look below
the fold for an example.

<!--more-->

So let's say we've got a function, that's specced:

```clojure
(defn applier [f x y]
  (f x y))

(s/fdef applier
        :args (s/cat :f (s/fspec :args (s/cat :x int? :y int?)
                                 :ret int?)
                     :x int?
                     :y int?)
        :ret int?)
```

Obviously this example may be slightly contrived. So since we're all conscientious
and stuff, we run around with all our vars instrumented all the time. At some
point, we put the following into the repl:

```clojure
(applier (fn [x y]
           (prn x)
           x) 12345 3)
```

Surprisingly, this results in:

```clojure
-1
0
...
131
28566
12345
12345
```

being printed. What's happening here is that the function you pass in is getting
checked to see if it matches the fspec. That was a little unexpected to me.
Especially since in my case, my fspec'd function threw an exception in some cases,
leading to a bit of a rabbit hole.

Which leads to one more bit of advice: "specs cover non-exceptional use".
There isn't a `throws` spec. You want to write your `:args` specs such that
they can't cause exceptions, or use `with-gen` to make sure you don't generate
args that can cause exceptions to be thrown.

Note all of this is as of clojure.spec 0.1.123, and clojure 1.9.0-alpha17,
and given those version numbers, likely to change.
