# TsCard
Typescript [pcsclite](https://github.com/santigimeno/node-pcsclite) wrapper library to support chip (asynchronous/emv) and memory smartcards.

This library is used by [Charta](!https://github.com/lewixlabs/charta), cross platform app to handle smartcards

## Memory Cards
This library, with supported manufacturer readers, uses a proprietary protocol to handle (read/write/verifyPsc) SLE memory cards.

Actual reader supported is ACR38.

Specifications here:
http://downloads.acs.com.hk/drivers/en/PMA_ACR38x(CCID)_v6.01.pdf

## Typescript Example
https://gist.github.com/lewixlabs/6fb7cc524902378338ccd56f9048537a
