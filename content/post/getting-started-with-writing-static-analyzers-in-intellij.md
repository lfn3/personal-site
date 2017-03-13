+++
date = "2017-01-21T22:01:00+13:00"
draft = false
title = "Getting started with writing static analyzers in IntelliJ"
+++

I've recently started writing some IntelliJ plugins to do some basic static analysis. It was quite a bit harder than I thought it needed to be, so I'd like to hopefully help anyone else avoid that difficulty. 

<!--more-->

The stuff I've dealt with so far is inspections and quick-fixes, so that's pretty much what I'll be talking about.

The process of actually creating the static analyzer wasn't that complicated, I spent most of the time figuring out how to navigate between the different representations of syntax that IntelliJ has.