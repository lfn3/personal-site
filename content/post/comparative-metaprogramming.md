+++
date = "2017-05-28T22:36:22+13:00"
draft = true
title = "Comparative Metaprogramming"

+++

I've been writing quite a bit of Java since I started at [LMAX](https://www.lmax.com/). And every now again I run into a problem where I think to myself, this would be really easy if I could just write a macro that took this then did all of that and... but I'm getting ahead of myself here. There's one specific situation I want to talk about, since that's what started me thinking about the kernel of this blog post.

<!-- more -->

So in our code base, like many others, there's some code which does serialization and deserialization. In our case, this is implemented with a bunch of `Marshaller` classes and `Codebook` classes. `Marshaller` is responsible for the (de)serialization, while the `Codebook` is basically a map we use to find the appropriate `Marshaller` class.

We don't really like the `Codebook`. The lookups into them are negligible next to the cost of actual (de)serialization, but it's still a cost that we eat on every message passed between our services, sometimes several times when nested objects are involved. Another issue is that we have to maintain the map which means we have something we can forget to update. Mostly it's the second part that bugs me.

All of this led us to the idea of using annotations and annotation processing to automagically remove the lookups and replace them with direct calls, by replacing any lookups into the map with a direct invocation of the marshaller for the target class. Ideally, we'd eventually end up being able to remove the codebooks entirely, along with the associated lookups.

We decided not to take this approach. We thought it was too much magic. At first I didn't agree, but after thinking about it for a while I changed my mind. I think my initial impression was mostly down to how I thought about Clojure's macros. In Clojure macros are an option of last resort, but when do need them, they let you accomplish things that would otherwise be impossible, or ugly and repetitive.

Macros are superficially very similar to the approach we were considering taking with annotations, since they also allow you rewrite code before it's executed into whatever form you want. But I have a much easier time justifying their use, since they seem much less magical to me. The biggest reducer of magicalness, the thing that makes macros much more palatable to me is that they are much more localized.

When I say localized I mean a couple of things. First of all, that the symbol you use is the one that performs the transformation of code. When you invoke a macro, you know _exactly_ which piece of code is being transformed, and what is doing the transformation.

It's a bit more challenging with annotations, since an annotation is basically just a marker. They can mean many different things depending on what tool is intended to consume them. For instance they are used extensively within IntelliJ to aid static analysis. The case we had in mind was code generation, where the code generator would live in another, disconnected part of the codebase. But you wouldn't know just by looking at this annotation what it's purpose is. You'd have to find the usages of it, and ignore all the chaff of it being applied, in order to figure out it's used in annotation processing. Some of the consumers of annotations also use string equality to find 'their' annotation, making it harder to find the action associated with an annotation.

With a macro, it's right in front of you, and macros have only one purpose - the transformation of code. As soon as you see `defmarco` instead of `defn` in front of a symbol, you know what's coming next. Of course the reasons you might want to transform some code are many and varied, but hopefully they're hinted at by the name of the macro. The other manner in which they are localized is their scope. In most cases, they only effect the code within the bounds of their surrounding parens. There are of course some macros like `defn` which also affect the global environment, but these are  more like keywords would be in Java.

Annotations on the other hand are more unbounded in scope. They can effect the operation of an entire class by wrapping and trapping every method call it takes, for instance. Admittedly a class isn't a concept that maps directly to Clojure, so the comparison is perhaps a little unfair.

In spite of all of this, annotation processing is still very useful. It's one of the few techniques we have available in Java to cut down on boilerplate, which is something Java is pretty notorious for. Ostensibly the primary mechanism we're supposed to use for eliminating repetitive code is inheritance, but in practice it isn't the silver bullet language designers hoped it would be. But that's a completely different topic.

There is one final problem I have with annotation based code generation, and this is a frequent problem with any metaprogramming technique. It isn't really part of the language. Sure, the annotations are part of the Java spec, but the part where you leverage those with another random jar you got probably off the internet into generating more code? It just seems kind of like an after-thought compared to how interwoven macros are into their target languages. In many cases, this is because the core of the language depends on macros to operate.

The biggest drawback to macros is also their biggest strength. They have the potential to contain _a lot_ of magic. Clojure has an implementation of [Communicating sequential processes](https://en.wikipedia.org/wiki/Communicating_sequential_processes) that is integrated pretty effectively into the language. This implementation is a major source of wtf when people look at the macros used to implement it. Admittedly this is a fairly extreme case, in that you walk the entire body of the enclosed code to find things that need replacing with fairly complex code. It does show the double edged sword very well however: anything you can do with your code, you can also do to your code. Thinking of some of the tangled messes past me has been responsible for, I think adding macros would have allowed me to make them much, much worse.

The potential for complexity in macros is high, since you're dealing with two different contexts at once. The fact they're written in the same language probably doesn't help.

We do of course have other metaprogramming options, and by far the most popular as far as I can tell is templating. Template systems are pretty widely available. I've used t4 templates, which is a Microsoft approved way to generate C# code, which is mostly what I'll be basing this next bit on. I've used html templating libraries before, but they usually don't have the same level of power as things like t4 or template haskell.

When I found t4 and used it to solve a couple of problems I had (generating code from API specs) I thought it was the greatest thing since sliced bread. I could write a little bit of code, and wrap it in some asp-ish looking tags, and in doing so cut out loads of boilerplate. It was also woefully under supported. Basic features like syntax highlighting were not supported by default and required a pretty janky plugin to get "working". This is, as far as I'm aware, the general pattern for code templating systems.

I don't know of a templating system that's been tightly integrated into a language successfully. They're usually something that's used by a small percentage of users as a result. Possibly that's something of a chicken and egg problem. We haven't seen a successful code templating system, so no one tries to build one. Part of me also suspects that macros might _be_ what you end up with if you try to write a templating feature into a language.

The lack of cohesion between a language and a templating system is most obvious because they involve at the very least a two step process - you have to generate the code from the template before you're able to use it. The same sort process applies to macros, but it's much more seamless since the expansion happens as part of the normal eval cycle.

<!-- TODO: make the jump from the paragraph above to this one smoother -->
In my experience you don't have to write as much macro to get a thing done as you would do with a templated solution. A well designed Clojure macro will rely to a pretty large degree on plain functions, and just use syntax quoting where necessary to get the result into source.

This is another strength of macros, or rather lisps in general. Since the structures you use to write code are the same as those that are present in the language, you can write unit tests for macros and the functions that are used in them. I admittedly haven't attempted to do so for templates (I didn't value automated tests as much as I do now) but I can't imagine it being a pleasant or easy experience.

Doing the same thing with a template is more challenging since there is a wider gulf between the template building the code and the code being built. You don't normally have easy access to both contexts at the same time. This is a double edged sword of course, since it's that blending of contexts that can make macros challenging to construct.

So why would you choose to add a templating facility to a language rather than a macro system? I'd argue that templates eat up less of your "complexity budget" than macros do. If you've already got a complicated language, with lots of interacting features to understand, macros might be too much. I'm assuming this is one of the reasons template haskell is a thing rather than macros being present in haskell. Adding another (complicated) feature you have to learn before you can read and understand the code others have written might be a significant deterrent from implementing macros, especially if you don't expect the users of your language to make much use of the metaprogramming options you provide. Templates might simply be good enough.

Templates also seems a little less magical than macros, since they produce concrete code that you can examine. You don't need to know anything about a templating system or how it works to read the code that it produces. At least some of the time. Often templating systems can produce garbage, unreadable code.
<!-- TODO: talk about the magical-ness levels of templates, problems around version control, shitty code.-->

There is one other approach to metaprogramming that's pretty different from the others I've dealt with, which is IDE based quick fixes, inspections and quick templates. I'm pretty much just looking at these from IntelliJ, since I haven't tried to write any for Visual Studio or other development environments. They're interesting since they're not as 'automatic' as other metaprogramming techniques, and to be honest I don't even know if they count as "proper" metaprogramming.

They are however undoubtedly useful, since they are more subject to programmer discretion than macros and can be applied and then further specialized to a particular situation. This is something you could do with a macro by expanding it in place and modifying it. That's not something I've ever considered until now however. I'm not sure that "in the heat of the moment" it would be an option I'd consider or choose to use. Quick fixes, on the other hand, are quite a bit more in your face than that technique, or possibly even macros if you don't know your way around a codebase.

And as a mechanism for protecting 80% of your codebase from something bad, while still leaving the 20% of cases where you need to do something that's possibly a little more complex open, inspections are a a great choice. If you need to ignore an inspection for some reason you can suppress them and it gives you a place to tell the next person who looks at the code why you're doing the thing that looks bad on the surface.

At least in the case of quick fixes however, I think the challenge of writing them can actually be higher than that of writing a macro, since you also have to write code to locate the behavior you want to fix. If the issue you're trying to deal with is general enough, however, they can be a great solution, since you'll have them available across any code base you're working with.

I think it's shame that IntelliJ's APIs aren't better documented, and that there isn't more material out there covering how to write these sorts of little plugins, since I think they're something most programmers would be able to come up with pretty quickly. To my mind they could fulfill the role that a jig would for a carpenter - a simple, one of thing you knock together to deal with a problem that you need to deal with repeatedly.

Unfortunately I think the cost of developing inspections and quick fixes is a little to high to be useful in the general case. I admittedly don't have enough experience with them to say for certain, but the time it takes to write them is too high for me to be willing to bang one out for any little issue. I think this is mostly due to the amount of jumping back and forth between the code I'm trying to build the tool around, and the code for the tool itself. If inspections and quick fixes were something that could be developed alongside the code base you want to use them in, I think they might be a little easier to get traction with.

All of this might give you the impression that I'm not a fan of techniques like templating or annotation processing. You'd be right, but I recognize the reasons why these were chosen instead of macros. The learning curve for using templates or annotation processing is definitely quite a bit lower. And there's less chance of you confusing the two different contexts your operating in when the code for those contexts is more separate. Macros are also uniquely suited to the syntax (or lack of syntax) that lisps have.
