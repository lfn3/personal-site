+++
date = "2020-07-11T21:31:22+12:00"
draft = true
title = "A gentle introduction to assembly with Rust (take 1)"
tags = []

+++

One of the things I quite enjoy is getting into the weeds on perf
related stuff. Previously I've mostly done this on the JVM, so I
stopped at JVM byte codes. The work I've been doing at [BlueCove](https://www.bluecove.com)
has mostly been with in Python, which seems like it can be well
complemented with Rust when we need to go fast.

A rework of the `asm!` macro has [recently landed](https://blog.rust-lang.org/inside-rust/2020/06/08/new-inline-asm.html) in nightly rust
so it seemed like the perfect opportunity to dig in and see if 
I can understand what's going on. I'm going to walk you through
what I did, and what I figured out during the process.

<!--more-->

My entry point to all of this was some of my colleage Dave's 
[teaching on perf](https://github.com/fastats/learning/tree/master/performance/2017_06_performance_basics).
There's a lot in there about getting set up and everything, 
but we can skip most of that, since we're just going to use
the [Rust playground](https://play.rust-lang.org/?version=nightly&mode=release&edition=2018) to run everything.

So skipping ahead to first example, which is printing 'My first program' with a syscall:

```asm

    global start

    section .text

    start:
        push dword msg.len
        push dword msg
        push dword 1
        mov eax, 4
        sub esp, 4
        int 0x80
        add esp, 16

        push dword 0
        mov eax, 1
        sub esp, 12
        int 0x80


    section .data
    msg db 'My first program', 0xf
    msg.len equ $ - msg
    
``` 

This does more or less the same thing as 
[the first example](https://play.rust-lang.org/?version=nightly&mode=release&edition=2018&gist=e983a5f5cffa51f4320f1176465d3a56)
in the rust blog post above, but does it in a very different way.

First of all, the pure assembly example above is using 32 bit assembly and syscalls.
Since it's 32 bit assembly we don't have access to the `syscall` instruction [^1], so we use the `int` (interrupt) instruction,
along with the `0x80` interrupt code to trigger a syscall[^2].

Since it has to be a full, standalone example, there's also a second syscall at the end to exit with a status code.
(I used the syscall tables [here](https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md) to figure this out)

We can convert it into more or less the same shape as the example from 
the rust blog (you should give that a go yourself before looking at my solution):
[interrupt syscall in rust](https://play.rust-lang.org/?version=nightly&mode=release&edition=2018&gist=bf2a415deec2493887d0413e051e939c)


[^1]: Figured this out from a [wikibook on assembly](https://en.wikibooks.org/wiki/X86_Assembly/Interfacing_with_Linux) which might be useful.
[^2]: I couldn't find a reasonable source for the interrupt table online, but `0x80` is apparently special enough to get called out by name e.g. 
      [here](https://linux-kernel-labs.github.io/refs/heads/master/lectures/interrupts.html#architecture-specific-interrupt-handling-in-linux)