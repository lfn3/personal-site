+++
date = "2020-07-12T22:17:22+01:00"
draft = true
title = "A gentle intro to assembly with Rust"
tags = []

+++

One of the things I've wanted to do for a while is really dig into
assembly and get into the weeds of how programs actually run.
A rework of the `asm` macro has [recently landed](https://blog.rust-lang.org/inside-rust/2020/06/08/new-inline-asm.html) in nightly rust
so it seemed like a good time. 

And compared to some other ways I've tried to approach this there's a lot less 
setup we need to do if we just use the [rust playground](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018) to
do all the heavy lifting.

My process for figuring things out has been pretty simple.
I write some simple rust code, look at the assembly output
and try to figure out what's going on (with lots of googling). 
I'm going to walk you through that, but explaining enough
that you won't need to do the googling. Hopefully.

<!--more-->

Let's start with the simplest possible thing I can think of:

```rust
fn main() {
    1 + 2;
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=9500bb2bc3f638a4dd89e81fecafac0e)

You can get the assembly output for this by clicking the three dots next to
`run` and selecting `asm` from the dropdown. You will probably also want
to change the flavour (often referred to as syntax elsewhere) of assembly to intel (rather than at&t) [^1]
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

So even though this is a debug build, evidently there's still some optimization going on,
since there's no numbers or anything that looks like it's adding them together.
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
(since the stack grows downwards in x86[^2]). Further down we can see
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
deal with the flag register. The flag register is possibly the most magical
of registers, since it's manipulated by a bunch of instructions as a side effect.

The last instruction we ran was `add`, which sets 6 of the the flags:
[carry](https://en.wikipedia.org/wiki/Carry_flag), [parity](https://en.wikipedia.org/wiki/Parity_flag),
[adjust (aka auxiliary carry)](https://en.wikipedia.org/wiki/Adjust_flag), [zero](https://en.wikipedia.org/wiki/Zero_flag),
[sign](https://en.wikipedia.org/wiki/Sign_flag) and [overflow](https://en.wikipedia.org/wiki/Overflow_flag)

In this case we're checking if the carry bit is set, and then setting the `al`
register to 1 if that's the case. What is this actually doing though?
The carry bit gets set to 1 if there is a `carry` from the two numbers we add,
meaning the resulting number is too big to be stored in the register. 
What should we do in that case? Let's read on to find out.

Then in the next line (`test al, 1`) we're checking if the value in `al` is equal to one.
(`test` does a a bitwise and operation on the two arguments - like `&` in rust.)
This sets some more flags, notably the `zero` flag, which is then read by the following `jne` instruction.

`jne` stands for jump if not equal (and again there's a series of 
[other](https://en.wikibooks.org/wiki/X86_Assembly/Control_Flow#Jump_Instructions) 
`j*` instructions). Since it uses flags, it just takes a single argument: where to jump to.

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

The version I've cooked up looks like [this](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=669b4155a1d818cc5c73b117b9454d48).
This is probably the "fanciest" possible version of this, since we're using as many features of the asm macro as possible:

  * we're letting the rust compiler pick the register we use, and then writing it in using the
    [`format` string behaviour](https://github.com/Amanieu/rfcs/blob/inline-asm/text/0000-inline-asm.md#inputs-and-outputs) of the `asm` macro.
  * we're also using [`inlateout`](https://github.com/Amanieu/rfcs/blob/inline-asm/text/0000-inline-asm.md#late-output-operands) to
    hint that we can just use a single register.
 
This seems like a reasonable point at which to break. We've covered a reasonable chunk of the instruction set in x64 assembly,
and seen examples of most of the classes of instructions. There's tons more we can explore:
stuff like how do loops work, and what happens when we use values that don't just fit in registers.
Hopefully the resources I've linked to from here are sufficent for you to continue digging in if you want,
and maybe I'll manage to follow this up. 

[^1]: This is one of the things that I find most confusing about assembly. There's (at least) two different major kinds of
	  syntax, and the are _only_ different in syntax. So the instructions are the same (`add`, `mov` etc), but they
	  take their arguments in different order. And the AT&T style assembly also has a pile of random symbols in it.
	  Since rusts `asm` defaults to taking intel style assembly, we're going to stick to that. If you do start googling stuff,
	  it's a roll of the dice as to which kind of assembly you'll get. AT&T has a lot of `%` symbols in it, so that's usually 
	  a giveaway.

[^2]: https://stackoverflow.com/questions/4560720/why-does-the-stack-address-grow-towards-decreasing-memory-addresses
