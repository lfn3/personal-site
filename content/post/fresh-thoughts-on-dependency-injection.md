+++
date = "2015-02-15T12:10:22+13:00"
draft = false
title = "Fresh Thoughts on Dependency Injection"

+++

This is essentially a follow up to an earlier post [Dependency Injection - A necessary evil?](/2014/09/18/dependency-injection-a-necessary-evil/),  from back when I had more reservations about using DI, and the benefits it gave me. I've since been fully converted to a 'believer'. This post is bascially about why and how I think that happened. 

<!--more-->

I'm still toiling in the C# mines, but I've moved from using [Ninject](http://www.ninject.org/) to a more... static library, [Autofac](http://autofac.org/). Ninject suffers from a little bit of [stringly typing](http://blog.codinghorror.com/new-programming-jargon/), while Autofac uses stuff like lambdas and generics to make errors happen at compile time rather than run time, which I'm a huge fan of. There's heaps of other neat stuff too, so if you're using C#, it's almost certainly worth checking out if you haven't already used it.

So the reason I was initally led to DI was due to the need to get tests across a fragile part of a long running project. This was basically a calendar you could making bookings on (the process of making a booking was fairly time consuming - the booking form has something like 30 fields on it or something.), and depending on what options you picked, it would block out more or less time around the date you chose. There were a whole bunch of other rules that could also apply, just to make it more fun. 

In any case, it was painful to manually test, and we ran into some weird bugs around public holidays and that sort of thing that we very luckily caught before they made it into production. It took that to get management to sign off on me adding tests to this area of the code. Since doing that, it's been (unsurprisingly) bug free. 

This experience was enough to sell me on the complexity trade offs of DI. At this point I still haven't fully embraced TDD or anything - I tend to mostly apply tests to areas I'm nervous about rather than everything. Not that I would have the time to put them on everything at my day job in any case. 

The other thing that I came to realize was that DI really does enforce cleaner separation between your code - you're constantly asking if this bit of code really belongs in your controllers (and the answer is usually no.) so tons of stuff gets pushed further out, where it's easier to abstract and extract for reuse. Presently I'm in the process of using T4 templates to generate a whole bunch of boilerplate I was writing for a lot of projects at work, something I probably never would have realised was an option without using DI.

Being able to draw clean lines around parts of your system also means that you can reason about them in isolation. Anything that means you don't have to juggle a whole bunch of infomation at once is great, and by splitting everything up for the purposes of injection it becomes much more explict where exactly any bad data is coming from, as long as you let your injected objects maintain responsiblity for their output. That is, output from anything injected should be modified as little as possible - project it into a new form, rather than mutating it's existing one if necessary.

And since you've got these independent objects, if you can't pin down what exactly is causing an error, it's a lot easier to write code to help you find out. Put the code into a test harness, through a whole bunch of stuff at it, and make sure your invariants hold. Just make sure you print out the inputs that cause a faliure when an assertion fails.

The last benefit I got is being able to use my test objects for development. I'm not sure if this is something that anyone ever touts, but whenever someone needs to make changes to a database, or some service you're dependent on isn't working, I fall back on the objects I've written for my tests. They're also great early on in development when you're not yet worried about integrating with actual data or services - you just want to prove the UI/UX works. Obviously you have to eventually switch back to the real thing, but avoiding that block, and hopefully maintaining flow is certainly worth the distance from reality.

So I guess the main reason I embraced DI was because of the confidence that unit tests gave me - but once I was there, it turns out there's other tangible benefits you get - a better awareness of where and why to decouple your code, an easier debugging experience as a result of that. Once you've got the test objects for testing, they're also perfect for when something external would otherwise stop you from making forward progress. I'm sure I'm preaching to the choir here, but if you're working in a mainstream OO language, and you aren't using dependency injection, you're missing out.