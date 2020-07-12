+++
date = "2020-07-12T22:17:22+01:00"
draft = true
title = "A gentle intro to assembly with Rust"
tags = []

+++

One of the things I quite enjoy is getting into the weeds on perf
related stuff. Previously I've mostly done this on the JVM, so I
stopped at JVM bytecode. The work I've been doing at [BlueCove](https://www.bluecove.com)
has mostly been with in Python, which seems like it can be well
complemented with Rust when we need to go fast.

A rework of the `asm!` macro has [recently landed](https://blog.rust-lang.org/inside-rust/2020/06/08/new-inline-asm.html) in nightly rust
so it seemed like the perfect opportunity to dig in and see if 
I can make some headway with assembly. I'm going to walk you through
what I did, and what I figured out during the process.

<!--more-->

We're going to start out by writing some _very_ simple Rust code in the playground, 
looking at the assembly it produces, and trying to figure out what it's doing,
and why. Let's start with the simplest possible thing I can think of:

```rust
fn main() {
    1 + 2;
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=9500bb2bc3f638a4dd89e81fecafac0e)

You can get the assembly output for this by clicking the three dots next to
`run` and selecting `asm` from the dropdown. You will probably also want
to change the flavour (often referred to as syntax elsewhere) of assembly to intel (rather than at&t) 
if it isn't already, by clicking the toggle under the `config` menu.

The assembly output from this in debug mode is far more massive than you'd expect - 
I get 157 lines. And most of it isn't our program. The code we've written should
be fairly easy to find though, as the compiler helpfully labels all of the functions
with their crate and function names. In this case since we're in the playground,
the create is implicitly `playground`, so we can find our code by searching with 
`ctrl-f` for `playground::main`. Doing this gets me to:

```x86asm
playground::main: # @playground::main
# %bb.0:
	ret
                                        # -- End function
```

So even though this is a debug build, evidently there's still some optimization going on.
All that's happening here is we're returning (`ret`) back to the function that called `playground::main`.
Everything prefixed with `#` is a comment, and therefore ignored when we run this code.

The only other point of interest is the label `playground::main:` - anything suffixed with `:` 
is a label we can jump to with various commands, and indeed if we continue searching for `playground::main` 
we can find a rather indirected call to it in `main`. Hopefully by the end of this we'll be understand that!

For now, let's try and evade whatever's doing the optimization:
```rust
fn add() -> usize {
    1 + 2
}

fn main() {
    add();
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=e06e9c1a6771d850be5e06abc6f70243)

Again, searching for `playground::main` get us to:

```x86asm
playground::add: # @playground::add
# %bb.0:
	mov	eax, 3
	ret
                                        # -- End function

playground::main: # @playground::main
# %bb.0:
	push	rax
	call	playground::add
# %bb.1:
	pop	rax
	ret
                                        # -- End function
```

So we've got a bit more progress here. Still some optimization going on, since we don't see 1 or 2 in the code,
just 3. We can see that being moved (`mov`) into the `eax` register in `playground::add`.
This must be how we're returning the value back up to `main`.

And indeed, inside `main` we can see `push rax` - saving the value in the register `rax` to the stack, then a
call to our `add` function, then we `pop rax` off the stack. The `push call pop` sequence is to preserve 
whatever values are in the registers used in `add`. It also just throws away the value we saved in `eax` in `add`,
because `eax` and `rax` are the same register. The table [here](https://en.wikibooks.org/wiki/X86_Assembly/X86_Architecture#General-Purpose_Registers_(GPR)_-_16-bit_naming_conventions)
shows how 'skinnier' registers overlap with their 'wider' counterparts.

So how can we make this actually do some math? Let's try again:

```rust
fn add(i: usize) -> usize {
    1 + i
}

fn main() {
    add(2);
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=0d821a33f2375ecaf3671c825a415c83)

So we've got a lot more going on this time:

```x86asm
playground::add: # @playground::add
# %bb.0:
	sub	rsp, 24
	mov	qword ptr [rsp + 16], rdi
	add	rdi, 1
	setb al
	test al, 1
	mov	qword ptr [rsp + 8], rdi # 8-byte Spill
	jne	.LBB8_2
# %bb.1:
	mov	rax, qword ptr [rsp + 8] # 8-byte Reload
	add	rsp, 24
	ret

.LBB8_2:
	lea	rdi, [rip + str.0]
	lea	rdx, [rip + .L__unnamed_2]
	mov	rax, qword ptr [rip + core::panicking::panic@GOTPCREL]
	mov	esi, 28
	call rax
	ud2
                                        # -- End function

playground::main: # @playground::main
# %bb.0:
	push rax
	mov	edi, 2
	call playground::add
# %bb.1:
	pop	rax
	ret
                                        # -- End function
```

The thing we were actually trying to produce is finally in there!
We can see `add rdi, 1` in the output, surrounded by a pile of other
stuff. So what is all this other code?

Let's start from the top of the call stack in `main`. 
First we can see `2` is stored in the `edi` register
before we call `playground::add`, so we know our argument must be in 
the `edi` register. Again, we can see the `push`, `pop` on `rax`, so that
must be the return value.

Now, looking into `playground::add` we first see `sub rsp, 24`. `rsp` is 
the register that holds the stack pointer, so this is growing the stack
(since the stack grows downwards in x86[^1]). Further down we can see
we shrink the stack by the corresponding amount with `add rsp, 24`.

Then we have `mov qword ptr [rsp + 16], rdi`. This is copying the 
value from `rdi` onto the stack at `rsp + 16` - the top of the region we just grew the stack by. 
The `qword ptr` (quadword (i.e. 64bit) pointer) bit is a hint to disambiguate the argument.
Why is that pushed that onto the stack? I _think_ this is just to make it easier to debug,
since we don't ever access that value again.

In any case, we then proceed on to actually adding 1 to `rdi`.
The value is stored back in `rdi`, and importantly for what comes next, 
we may set some of the [flags](https://en.wikibooks.org/wiki/X86_Assembly/X86_Architecture#EFLAGS_Register). 

Then it gets complicated again - we've got `setb al`. All of the `set*` 
[instructions](https://github.com/HJLebbink/asm-dude/wiki/SETcc)
deal with the flag register, and are used to extract values from flags to registers.
In this case we're checking if the carry bit is set, and then setting the `al`
register to 1 if that's the case. 

Then in the next line (`test al, 1`) we're checking if the value in `al` is equal to one.
This sets some more flags, which are then read by the following `jne` instruction.

`jne` stands for jump if not equal (and again there's a series of 
[other](https://en.wikibooks.org/wiki/X86_Assembly/Control_Flow#Jump_Instructions) 
`j*` instructions)

Looking at where that jumps to gives us a big hint about the intent of the 
logic above: `core::panicking::panic@GOTPCREL` really gives it away.
Basically all of this chunk of assembly from `setb` to `jne` is checking if we've overflowed
the register and panicking if we have.

The one bit we didn't discuss is `mov qword ptr [rsp + 8], rdi # 8-byte Spill`.
As the comment implies this is "spilling" the value from the `rdi` register
onto the stack, since the code we're possibly about to jump to might 
overwrite that register - immediately after the `jne` we load the value back off 
the stack.

Finally we shuffle the stack pointer back to it's starting point, and `ret`
back to the caller. `ret` uses the last value on the stack (which is pushed by `call`)
to figure out where to jump back to, so moving the stack pointer back is _very_ important.

So maybe at this point we've seen enough to take a stab at replacing the guts of the `add` 
function with the `asm!` macro. Since we're interested in performance, 
we'll ignore those pesky overflow checks, and just assume that we're within the bounds of `u64`.

The biggest new thing we'll have to deal with here is specifying the `in` and `out` registers.
The [rfc](https://github.com/Amanieu/rfcs/blob/inline-asm/text/0000-inline-asm.md#guide-level-explanation)
has a very approachable explaination of these, so I'd recommend reading that.
There's a skeleton you can start with [here](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=d511cf5e95ba5cdfbcffaebaf5f72300),
if you want to have a go yourself.

The version I've cooked up looks like [this](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=669b4155a1d818cc5c73b117b9454d48)
I'm going to park it here at this point - we've covered a reasonable chunk of the instruction set in x64 assembly,
and seen examples of most of the classes of instructions. Hopefully the resources I've linked to from here
are sufficent for you to continue digging in if you want.

[^1]: https://stackoverflow.com/questions/4560720/why-does-the-stack-address-grow-towards-decreasing-memory-addresses
