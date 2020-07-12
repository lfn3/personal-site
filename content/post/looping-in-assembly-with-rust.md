+++
date = "2020-07-12T22:34:22+01:00"
draft = true
title = "Looping in assembly with Rust"
tags = []

+++

Following on from my last post, we're going to once again
use the [rust playground](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018) 
to figure out how to construct loops in assembly.
If you haven't read the [prior post]({{< ref "a-gentle-introduction-to-assembly-with-rust.md" >}}) already, 
I'd highly recommend doing that first. 

<!--more-->

Let's just jump straight in with some code:

```rust
fn main() {
    for _i in 0..20 {
        
    }
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=db517862a3454393e1711115c6150f1e)

And look at the associated assembly:

```x86asm
playground::main: # @playground::main
# %bb.0:
	sub	rsp, 56
	mov	dword ptr [rsp + 16], 0
	mov	dword ptr [rsp + 20], 20
	mov	edi, dword ptr [rsp + 16]
	mov	esi, dword ptr [rsp + 20]
	call	<I as core::iter::traits::collect::IntoIterator>::into_iter
	mov	dword ptr [rsp + 12], eax # 4-byte Spill
	mov	dword ptr [rsp + 8], edx # 4-byte Spill
# %bb.1:
	mov	eax, dword ptr [rsp + 12] # 4-byte Reload
	mov	dword ptr [rsp + 24], eax
	mov	ecx, dword ptr [rsp + 8] # 4-byte Reload
	mov	dword ptr [rsp + 28], ecx

.LBB25_2:                             # =>This Inner Loop Header: Depth=1
	lea	rdi, [rsp + 24]
	call	core::iter::range::<impl core::iter::traits::iterator::Iterator for core::ops::range::Range<A>>::next
	mov	dword ptr [rsp + 36], edx
	mov	dword ptr [rsp + 32], eax
# %bb.3:                              #   in Loop: Header=BB25_2 Depth=1
	mov	eax, dword ptr [rsp + 32]
	mov	ecx, eax
	test	rcx, rcx
	je	.LBB25_4
	jmp	.LBB25_7

.LBB25_7:                             #   in Loop: Header=BB25_2 Depth=1
	jmp	.LBB25_6

.LBB25_4:
	add	rsp, 56
	ret
# %bb.5:
	ud2

.LBB25_6:                             #   in Loop: Header=BB25_2 Depth=1
	mov	eax, dword ptr [rsp + 36]
	mov	dword ptr [rsp + 44], eax
	mov	dword ptr [rsp + 48], eax
	mov	dword ptr [rsp + 52], eax
	jmp	.LBB25_2
                                      # -- End function
```

There's quite a bit of noise in here, mostly related to calling the 
`Iterator` related functions.
I use the labels and associated comments to orientate myself:
From the comment we can tell the loop actually starts at `.LBB25_2`.
The first thing we do there is extract the next value from the 
iterator above using `::next`. It looks like that spits a value into
the `eax` register, which we then copy over to `ecx` and `test`.
This must just be a boolean indicating if we can continue, rather 
than the value of `_i`, since we don't actually use `_i`. 

To confirm, this, let's modify the code to use `_i` and see 
what changes:

```rust
fn consume(i: usize) {
    i + 1;
}

fn main() {
    for i in 0..20 {
        consume(i)
    }
}
```
[playground link](https://play.rust-lang.org/?version=nightly&mode=debug&edition=2018&gist=15ea425e9477687fef27024ad7f5fc99)

Chucking the assembly from both of those in intellij's diff viewer
yields:

![diff output, showing call to consume](/img/posts/looping-in-assembly-with-rust/asm-diff.png)

So we know the body of the loop happens inside `.LBB25_6`
(The labels will have been renumbered between these two examples by the addition of the new `consume` function.)