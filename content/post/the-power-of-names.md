+++
date = "2019-04-07T10:45:40+01:00"
draft = false
title = "The Power of Names"
tags = ["BlueCove", "Programming"]

+++

So I've just started working with a new team at [BlueCove](https://bluecove.com).
I'm really enjoying it, especially since we have a lot of decision making space
to work with. The company has just turned one (there was cake, it was delicious)
and the process of building up the code we need is still in full swing. 

Something interesting happened to me the other day. I was talking with one of my
co-workers about a problem we were trying to solve, and was about to reach for
one of the terms from the
[Domain Driven Design (DDD)](https://amzn.to/2TtXnGz)[^1]
book, namely [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html)
I asked him if he'd read the book, and he hadn't. I didn't think much about it 
until I was on the tube home, and I was going over my day.

Before we go any further, I should give you a hefty disclaimer - I'm not any 
sort of expert in what I'm about to write about. When I was explaining why I was
excited about writing this to my wife, she told me it sounded like I was writing
about [Semantics](https://en.wikipedia.org/wiki/Semantics), which prompted an
educational excursion through wikipedia. I am, however very willing to be wrong
on the internet, so let's dig in.

<!--more-->

So while I was commuting home, I realised that a chunk of the language I use 
when talking about design with other programmers comes from the DDD book. More 
broadly, I've picked up quite a few bits of language from various places that 
I think help drag conversations up the "ladder of abstraction" - even that's a 
term behind which there's a bunch of related ideas. I think this is the obvious 
superpower[^3] that humans have. Once we know something, name it, and share it we 
gain a form of limited telepathy that lets use one or a few words to describe 
something, and often much more evocatively than using a whole sentence or more.

Since I called it a superpower I obviously reckon it's pretty neat,
but it has some limitations. The obvious part is that it requires both parties 
to a conversation to have an understanding of whatever terms you're using. And
you probably want it to be the same understanding. For instance
[TDD](https://en.wikipedia.org/wiki/Test-driven_development) is overloaded - 
while it might be safe to assume programmers don't think it stands for 
[Telecommunications device for the deaf](https://en.wikipedia.org/wiki/Telecommunications_device_for_the_deaf),
it's not like we know what paths our fellow coders have taken through life. 
They may have just not run into a term before. Or it can be coloured by their 
experiences with it. Something you view as unambigously excellent like 
[Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) 
might be a jungle someone else had to cut through. And I'm sure there 
are plenty of us that have been scoffed at for not knowing a term.

But of course, we all start out that way. Writing this has made me realise how 
much I like learning new bits of language that I can use - not only with my 
peers but also to help my clarify my own thoughts. Some of my favourite 
conference talks have introduced me to new words: 
[Peter Goodman](https://twitter.com/petegoo) 
[told me](https://www.youtube.com/watch?v=b572NbuLDUI) what
[Connasence](https://en.wikipedia.org/wiki/Connascence) is. 
[Rich Hickey](https://twitter.com/richhickey) has given me 
[Complect](https://www.infoq.com/presentations/Simple-Made-Easy)
and [Hammocking](https://www.youtube.com/watch?v=f84n5oFoZBc).
I'm pretty sure a big part of the reason why I love Clojure is because almost 
every talk expands my vocabulary or even just sharpens my knowledge on some bit
of language, like for instance the distinction between 
[bugs and errors](https://www.youtube.com/watch?v=FihU5JxmnBg).

What's interesting to me is that a lot of these terms haven't really escaped the
Clojure community. While I can be relatively sure that at a Clojure meetup I can 
throw Complect around with reckless abandon, I'm less sure of that during my day
job. To bring it back to where this started - there's a bounded context within
which a name is valid, or at least has a given meaning. DDD also offers us a 
related term: [Ubiquitous Language](https://martinfowler.com/bliki/UbiquitousLanguage.html)
I think this describes one of the smallest contexts within which language is 
valid[^2] - DDD's author, Eric Evans, talks about it
within the scope of a project, and being formed and used between the authors 
and expert users of a system. Hauling it up to a more general level I think 
yields [jargon](https://en.wikipedia.org/wiki/Jargon)

> Jargon is specialized terminology used to define specific words and phrases 
used in a particular profession, trade, or group.

It's tempting to think of this like an onion - with layers of more general 
language expanding outwards from some core of highly specialized language. If we
drew on the examples above:

![An onion-like image of the layers of language](/img/posts/the-power-of-names/language-onion.png)

You might notice the little question marked section there. There's obviously a
unit of language knoweledge smaller than a team - you!

There's a problem here though, your command of language covers more than one 
domain, so I think if we try and capture that we end up with something a bit 
messier:

![A blob of my personal language knowledge, highlighting areas like programming 
and coffee](/img/posts/the-power-of-names/language-starfish-take-2.png)

I don't think this tell us much in isolation. Almost anything  you measure needs
a point of comparison to make sense of. So let's zoom in a bit on the 
programming chunk, and add another person's language blob:

![Overlaying two people's blobs of language, highlighting the areas where our
language differs](/img/posts/the-power-of-names/language-map.png)

Note this is just an illustrative example. I don't think you could or should
actually produce something like this. But it does put into pictures what started
this whole thing off - there's a difference in the language my colleagues and I
know and use to talk about programming.

Some of the gaps here look scary. And even more scarily, it's not just about 
language, since words are a mechanism for encoding concepts and ideas, there's 
a gap in knowledge in those shaded chunks.

Is this actually a problem? Absolutely not. In fact I'd say having a team where
everyone knows exactly the same things is a terrific waste. You're far better 
off having a wide range of experiences and the resulting different ways to talk
about those experiences. And if you're in a healthy organisation, saying 
"I don't know this" will be seen as a chance to show you something neat, rather 
something to make fun of. 

I'm sure there's more I could say about the relationship between progammers and
language[^4], but this post is closing in on 1000 words and at risk of losing 
coherence. So what point was I trying to make with all of this? I think the 
shared language teams, communities, and programmers use and have built up over
time has made us more effective. Personally I find learning new bits of 
specialized language very interesting[^5], and I think we should try and spread
the knowledge of these words more widely. Finally, different knowledge helps us
be more effective as teams, as long as we trust each other and feel safe not
knowing something. 

I hope you got something good out of this. If you reckon I've got something 
wrong here, or just want to have a bit of a yarn, the best way to reach
me is on [twitter](https://twitter.com/lfln3).

[^1]: This is an Amazon affiliate link. If you object to that sort of thing, 
      use [this link](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) 
      instead.

[^2]: There are tighter scopes - [Cryptophasia](https://en.wikipedia.org/wiki/Cryptophasia)
	  is the language shared by twins, and generally unintelligble by anyone 
	  apart from them.

[^3]: Many ancient cultures and religions held that knowing the 
	  ["True Name"](https://en.wikipedia.org/wiki/True_name) of something or 
	  someone was to have absolute power over them.

[^4]: I'm so sure I've already pulled the kernel of another blog post out of 
	  this one.

[^5]: If you're a massive nerd like me and you've got a favourite bit a jargon,
	  please [tweet](https://twitter.com/lfln3) me a mini-explaination, I'd love
	  to hear about it.