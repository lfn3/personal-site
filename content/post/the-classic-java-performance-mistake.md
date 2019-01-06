+++
date = "2018-11-19T18:32:40+00:00"
draft = true
title = "The Classic Java Performance Mistake"
+++

Late last year we built and shipped a new feature: allowing orders with Minimum Trade Quantity
(in Fix, `MinQty`, tag 110) to passivate.

Naturally we were a bit nervous about the performance implications of this, since it involves a new condition right 
in the core of the matching cycle. Sure enough, one of our graphs showed telltale signs of our meddling:

![Graph of benchmark history, showing a dip](/img/posts/the-classic-java-performance-mistake/benchmark-graph-dip.jpg)

<!--more-->

Fortunately, the impact isn't in the heart of the EV, but rather downstream a bit in the MTF market data gateway:

![Ev gateway layout](/img/posts/the-classic-java-performance-mistake/ev-gateways.png)

That's still pretty bad, since our customers don't really like the idea of trading blind.
Thankfully we had a pretty good idea of where the impact was coming from, since the code we'd changed in the gateway
was relatively contained. 

We had added another conditional check to all our FIX market data sessions:
```

```

Why did this hurt us so badly, given it's just comparing a couple of fields?

It falls into one of the more notorious 