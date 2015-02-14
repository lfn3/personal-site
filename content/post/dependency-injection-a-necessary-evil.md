+++
date = "2014-09-18T07:27:25+12:00"
draft = false
title = "Dependency Injection - A necessary evil?"

+++

*Basically my position on DI has since changed - go take a look at [Fresh Thoughts on Dependency Injection](/2015/02/14/fresh-thoughts-on-dependency-injection/)*

So first of all, to preface this and so you get a little bit of insight from where I'm coming from, I spend most of my days toiling in the great C# mine, so lovingly provided by Microsoft. I used to be a python guy, and I've gotten dangerous with Go, and am trying to do so with Clojure. The clojure thing is recent, so this might be a bit more cargo culty than I'd like. Anyway.

<!--more-->

So the shop where I currently get paid is a little behind the times. Legacy code base 
(in the [Micheal Feathers](http://www.amazon.com/gp/product/0131177052/ref=as_li_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0131177052&linkCode=as2&tag=byatlascom-20&linkId=A3OM5UCAGXASTXG3)
"Legacy code is code without tests" sense) and an enterprise-y monolithic feel. There's some seemingly arbitrary layering and attempts to divide responsibility, but (to me at least) they seem to all follow their own internal logic rather than any cohesive structure.
<img src="http://ir-na.amazon-adsystem.com/e/ir?t=byatlascom-20&l=as2&o=1&a=0131177052" width="1" height="1" border="0" alt="" style="border:none !important; margin:0px !important;" /> 

Luckily, I've managed to largely dodge that particular bullet, and mostly work on stuff external to the mothership. 

One of the things I've been trying to adopt is unit testing (or just testing in general). It's proven to be far more difficult to implement in ASP.net MVC than I was expecting (hoping?). One of the tools you are essentially required to lean on (which is not entirely a bad thing, admittedly.) is dependency injection (hereafter referred to as DI), which, as the title implies, I view as almost as much of a pain as it is useful.

It does, very usefully, impose a need to split apart unrelated functionality. There seems to be a very real love of gigantic libaries, sprouting tendrils to handle every possible eventuality, in the C# world. I've seen my co-workers build them, repeatedly, fuelled by some sort of steriodially inflamed Not Invented Here syndrome. By using DI you stand a far better chance of producing something that's at least slightly reusable.

I can sympathize with their distrust of DI a little, at least. DHH has recently spoken of "test induced design damage" and I think it's certainly possible (ok, I know it's possible, I've done it.) to contort your code into strange and impossible shapes as a result of desire to test everything that's not nailed down.

The primary thing that spooks me about DI is the explosion of complexity necessary in its usage. Layer upon layer of factories, facades and interfaces (Seriously. So many interfaces.) follow in it's wake, each seemingly necessary, but all clouding the actual purpose of your software in arcane scribblings. And for what? Sure, you might be able to test it, but if it takes you half an hour to trace through the code to figure out that an error found in production was caused by something 6 layers deep, and would have been found by a test that would only fail very intermittently...

I guess that you have to believe that the safety net given to you by the tests is worth the time it takes to write them and maintain them and the additional complexity that DI causes. Not to mention the cost of refactoring an existing system (presumably without the benefit of tests to make sure you didn't break anything. Or at least much.) I don't know that I'm at that point. Yet.