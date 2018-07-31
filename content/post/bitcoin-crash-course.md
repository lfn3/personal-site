+++
date = "2018-07-23T11:22:00+01:00"
draft = false
title = "Bitcoin crash course"

+++

I've just moved to London, and been working on [LMAX Digital](https://www.lmaxdigital.com/) and as a resulted been given 
a bit of a crash course on how exactly Bitcoin (and other crytocurrency) transactions actually work. I think there's a
near zero chance I'm going to remember it as I've moved on to another area of work, so I figured I'd better write it 
all down before I forget it all.

<!--more-->

There's quite a few concepts associated with the bitcoin blockchain, but probably the most important one, and the only 
thing that actually exists as a concrete object is the transaction. This is what actually goes into any given block
on a blockchain.

So let's talk a little about the structure of the actual payments or transactions. There's some header information, but
mostly they consist of inputs and outputs. The inputs are the unspent outputs in a previous transaction that you have 
the ability to spend, and the outputs are the payments that you want to send to other addresses.
Of course it's a little more complicated than that, since we have to have some verification - you have to form a 
transaction that proves you can actually spend the inputs, and create some sort of condition that needs to be met for 
the recipient to spend your outputs.

This is done by building up a script from the inputs and outputs of transactions. The script is run by all the nodes 
participating in the bitcoin blockchain to verify that the inputs are allowed to consume the outputs from older 
transactions they refer to. The structure is fairly recursive, and probably best described in pictures, rather 
than words:



It's easiest if we consider the output first, as these form the input to the next transaction. Each output specifies a
`script`, written in a forth like language. This specifies what `scriptSig` is needed to unlock the output and 
spend it. When it comes time to spend that output, we prepend the `scriptSig` that's provided with the input, and 
check that the script leaves `true` on top of the stack.

Let's work through an example of that. The most common `script` is `Pay-to-PubkeyHash` which looks something like:
`OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG`. `<pubKeyHash>` is a placeholder for the hash of an actual
public key, provided by whoever wants to receive the payment. This is often what's referred to as an address.
The corresponding `scriptSig` that's used to spend this transaction will look like: `<sig> <pubKey>`. The reason for 
this is that public keys can be relatively widely shared or unsecured, so we include a signature generated from the
private key which can be verified by using the corresponding public key. So we join the two together and get:
`<sig> <pubKey> OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG`

So anything that isn't an operation get's copied straight onto the stack, so the first thing that happens is the  
`<sig>` and `<pubKey>` are pushed onto the stack:
```
Stack:
<sig> <pubkey> 

Remaining Script:
OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

`OP_DUP` copies whatever's on the top of stack and pushes it onto the stack, yielding:
```
Stack:
<sig> <pubkey> <pubkey> 

Remaining Script:
OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

`OP_HASH160` hashes the value on the top of the stack, then pushes it back onto the stack, giving us:

```
Stack:
<sig> <pubkey> <pubKeyHash>

Remaining Script:
<pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
```

The `pubKeyHash` from the `script` then gets pushed onto the stack, and we then compare it to the hash we generated
in the previous step. This is the first point at which we actually check the input is allowed to be spent, by 
verifying that the `pubkey` corresponds to the hash in the `script`. If this step fails, the transaction will get 
rejected by miners and not included in a block. Assuming this succeeds, we then move on to the final step:
```
Stack:
<sig> <pubkey>

Remaining Script:
OP_CHECKSIG
```
 
`OP_CHECKSIG` does what it says on the can, checking the signature on the stack was produced using the private key 
corresponding to the public key on the stack, and that the signature is for the contents of the entire transaction.
This leaves either `true` or `false` on the stack, which indicates if the transaction is valid or not.

At this point the transaction can be broadcast to the blockchain, where miners will run the same set of checks before 
deciding if they want to include it in the block they're mining or not. Their choice is mostly based on how many 
bitcoins you're willing to give them: during the process of forming a transaction you should leave an amount from your
inputs that isn't allocated to an output for the miner to claim, to incentivize them to pick your transaction to be 
included in the block. 

As each block is of a fixed size (1mb at the time of writing) miners will want to pack the block 
with the transactions offering the highest payout to them. For this reason transaction fees are often measured in 
Satoshis per byte (a Satoshi is the smallest useable increment of a bitcoin: one hundred millionth of a bitcoin).

What I think is most interesting about this is what we left out: we didn't talk about wallets or addresses, 
since they're abstractions we've built on top of transactions. A wallet is, at a bare minimum, the keys required to 
produce the signatures for a given output. Often we want other features like knowing the balance we have available 
(that's the sum of all the unspent transactions we have the ability to produce signatures for).

Similarly, an address is really just a output script that you know you can fulfill the requirements for. Typically 
you'll only supply the `pubKeyHash` in the script we worked through above, but of course if you're using a multisig
wallet or something else more exotic, you can ask whoever is paying you to use a more complex script.

This about sums up what I think is the essential elements of the bitcoin blockchain.

<!-- 

Holding pen


So let's start by talking about an address. A bitcoin address is a public key (or a representation of it, we'll get into
that later) that we can direct payments to. In order to spend whatever bitcoins are sent to that address, you'll need to
sign the transaction with the private key corresponding to the public key identifying the address.

One of the interesting bits about this is that the wallet isn't actually a real, concrete thing. It's just a collection 
of payments that haven't been spent, and some bit of information that someone has allowing them to gain access to those
payments

This is one of the defining characteristics of bitcoin, that errors are fairly fatal to your net worth, and irrecoverable.
Barring the generosity of whoever's on the other end, assuming they even exist. 


There's several different forms of common `script`s such as pay to `pay-to-PubkeyHash` or `pay-to-ScriptHash`.


In the case of `pay-to-PubkeyHash` the script looks like `OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG`
this is combined with a `scriptSig` on the 


<!--TODO: is each input signed, or just the whole transaction? Can you include inputs from multiple different addresses?-->
In order to actually authorise the payment, you have to sign each of the inputs with your private key. The actual 
mechanics of this are complicated, since a bitcoin transaction also includes a miniature program indicating how to 
validate a transaction and allow the recipient to actually spend the transactions that were sent to their address.
There's a bunch of different common programs &... 

#TODO! 

In order to get your transaction actually processed by "the blockchain" (actually the lucky computer that mines the next block)
you need to leave a small amount of "change" in your transaction that will be given to the miner to include your transaction.
This is a way of aligning the incentives of miners and people who want to use bitcoin.

Each transaction takes up a certain amount of space in a block (measured in bytes). The amount of payment you offer 
should correspond to amount of data your transaction will take up in the block, since miners can choose between include
your transaction or any other transaction, and will want to pack the ones that result in the largest payout to them.


-->
