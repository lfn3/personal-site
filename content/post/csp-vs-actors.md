+++
date = "2016-06-21T17:26:00+12:00"
draft = true
title = "CSP vs Actors"

+++

This post could also be called core.async vs pulsar, since it's mostly influenced by my dealings with those two libraries. Calling pulsar a library might be a stretch though. 

Actors claim to provide fault isolation. I would argue that core.async does that just as well (though the behaviour is suprising the first time around.) and lets you deal better with the aftermath of failure than actors. Channels aren't as coupled to a go block as an actor is to it's mailbox. (at least in pulsar, something like orleans or orbit provides nicer guarantees around message sends/reciepts.) This is great. It lets you deal with failure in a go block without (necessarily) affecting upstream writers until necessary.

Conversely, one issue we've had with pulsar is having to synchronize access via a supervising actor to a bunch of child actors so that we can start them if they're either not started or not alive when we try to pass a message to them. With regular clojure this is a lot easier. You can put a map of channels in an atom, and use `compare-and-set!` to safely create a new channel and backing go-loop without co-ordination.

Doesn't work if you provide a channel as the output of a function, since you have to be able to hang on to the channel through restarts of a go-loop.