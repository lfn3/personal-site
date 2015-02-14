+++
date = "2015-02-14T17:25:22+13:00"
draft = true
title = "Fresh Thoughts on Dependency Injection"

+++

This is essentially a follow up to an earlier post [Dependency Injection - A necessary evil?](/2014/09/18/dependency-injection-a-necessary-evil/),  from back when I had more reservations about using DI, and the benefits it gave me. I've since been fully converted to a 'believer'. This post is bascially about why and how I think that happened. 

<!--more-->

I'm still toiling in the C# mines, but I've moved from using [Ninject](http://www.ninject.org/) to a more... static library, [Autofac](http://autofac.org/). Ninject suffers from a little bit of [stringly typing](http://blog.codinghorror.com/new-programming-jargon/), while Autofac uses stuff like lambdas and generics to make errors happen at compile time rather than run time, which I'm a huge fan of. There's heaps of other neat stuff too, so if you're using C#, it's almost certainly worth checking out if you haven't already used it.



