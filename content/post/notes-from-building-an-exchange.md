+++
date = "2018-02-13T12:35:40+13:00"
draft = true
title = "Notes from Brian Nigito's Building an Exchange talk"
+++

Jane Street: Building an Exchange
https://www.youtube.com/watch?v=b1e4t2k2KJY&t=1s

US equities markets:

3m orders/sec peak
1000s of participants
"several million" live orders
10k symbols/instruments

Indexing instructions on the gateways rather than on the EV?
Could we send back an instruction from the EV to the gateway with less data? 
Retain some of the info for the fix message we send back in memory on the gateway?
Retransmitters - don't NAK to exchange, but rather to another machine.

ETF market making - risk limits across whole market enforced atomically. Same problem as our NOP limits?
Most of the gain is in running multiple memory grabs at once. (Prefetch next batch of orders?)

Splitting based on symbol means we need to order the stream going into the Gateway. (or deliver without order guarantees)

They have a system where the gateway proposes the next sequence number to use. Lots more logic in the gateways.

More emphasis on (explicit) state machines.