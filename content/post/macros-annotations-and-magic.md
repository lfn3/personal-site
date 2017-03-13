+++
date = "2017-03-13T22:36:22+13:00"
draft = true
title = "Macros, annotations, and magic"

+++

I've been writing quite a bit of Java since I started at [LMAX](https://www.lmax.com/). And every now again I run into a problem where I think to myself, this would be really easy if I could just write a macro that took this then did all of that and...

Of course there are tools for Java with similar levels of power, but they all suffer from the same problem. Too much magic.

<!-- more -->

What I mean by magic is non-obviousness. This can take many forms, but the most blatant one is non-local effects. When a pieces of code 500 lines away from another can change each others behavior it can be a recipe for confusion. The case most people have experienced in Java is annotation processing, where adding @something at the top of your class can change _everything_ it does, or how often it does it, or when.

This is a really useful feature, since it's one of the few ways we have to cut down on boilerplate in Java, a language thats infamous for it's verbosity. The problem is it hides behavior. You can no longer simply read code to understand what it does, you also have to mentally transform it based on what the annotation processor will do.

Macros are not immune from this problem, since they are by definition, syntax transformations. If you want to understand what they do you still have to perform the same mental mapping. They can have precisely the same range of effects as annotation processing, since you can basically add any arbitrary code you want, with the added bonus of being able to execute at compile time.

I would argue that they are better integrated into the target language than annotations are into Java. This starts to make them a little less magical. They have very similar semantics to plain old functions, just with an additional step that occurs before evaluation.

Unlike annotations, their effects are usually localized. You could write a macro that changed an entire namespace, but you would perhaps rightly be regarded as doing something fairly wrong for doing so. Limiting the scope of their magic goes a long way towards making it more palatable.
