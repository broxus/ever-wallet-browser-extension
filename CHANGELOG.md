## Changelog

### 0.3.41 (2024-06-19)

Features

* Added `TIP-4.2.2` support

### 0.3.40 (2024-06-05)

Features

* Added support for `everscale-inpage-provider@0.3.65`

### 0.3.37 (2024-02-12)

Features

* Added support for `everscale-inpage-provider@0.3.64`
* Added local transaction tree execution

### 0.3.36 (2023-09-25)

Features

* Estimate min attached amout for token transaction

### 0.3.35 (2023-09-07)

Features

* Added `protobuf` transport support

### 0.3.34 (2023-08-22)

Bugfixes

* Fixed staking abi calls error

### 0.3.33 (2023-08-02)

Bugfixes

* Fixed NFT loading error in some cases

### 0.3.32 (2023-07-03)

Features

* Update staking ABI

### 0.3.31 (2023-06-30)

Features

* Export private key
* Multisig "add custodian" notification

### 0.3.30 (2023-06-16)

Bugfixes

* Fixed encrypt/decrypt with derived keys
* Fixed nft duplication

### 0.3.29 (2023-06-13)

Features

* Add multitoken collection/wallet support

### 0.3.28 (2023-04-21)

Features

* Public keys in contacts
* Configurable `Multisig 2.1` transaction confirmation time

Bugfixes

* Fixed onboarding opening on extension install

### 0.3.27 (2023-04-06)

Bugfixes

* Fixed external accounts in `Select account`
* Fixed adding zerostate external accounts

### 0.3.26 (2023-03-28)

Bugfixes

* Fixed infinite nft list loading in some cases
* Removed redundant debug log in production build

### 0.3.25 (2023-03-28)

Bugfixes

* Fixed white screen in some cases
* Fixed infinite loading in assets management

### 0.3.24 (2023-03-28)

Features

* Search by account address in `Select account`
* Updated account management in `Manage seeds & accounts` menu

Bugfixes

* Wait until fees data loaded on the transaction confirmation screen
* Disable `select` button if no keys selected in `Select keys` list

### 0.3.23 (2023-03-15)

Features

* Added support for `everscale-inpage-provider@0.3.56`

Bugfixes

* Fixed liquid staking exchange rate
* Fixed performance issues with big seeds/keys list

### 0.3.22 (2023-03-15)

Features

* Added `Select account` menu
* Added `View in explorer` account menu item
* Added logout confirmation
* Added the ability to change seed password
* Added unconfirmed transactions notification badge
* Reworked `Manage seeds & accounts` menu

Bugfixes

* Fixed ledger connection issues with `everscale-inpage-provider`

### 0.3.21 (2023-03-04)

Bugfixes

* Fixed ledger HID device access request

### 0.3.20 (2023-02-28)

Features

* Added support for `executeLocal` (`everscale-inpage-provider@0.3.52`)
* Get network id (global id) from network capabilities

Bugfixes

* Fixed incorrect pending transactions in token transaction list

### 0.3.19 (2023-02-23)

Bugfixes

* Fixed white screen on send window when using ledger

### 0.3.18 (2023-02-22)

Features

* Added contacts
* Added ledger-app v1.0.9 support
* Added the ability to edit selected network
* Add default wallet on empty public key add

Bugfixes

* Fixed stever vault subscription
* Wait for contract state on `send message` approval
* Added `Custodian key not found` error on `send message` approval

### 0.3.17 (2023-02-14)

Features

* Added support for signature id (`everscale-inpage-provider@0.3.50`)

Bugfixes

* Fixed explorer link format in custom networks
* Fixed zerostate messages on ledger

### 0.3.13 (2023-01-27)

Features

* Added ledger-app v1.0.8 support
* Added custom networks support
* Updated onboarding UI

Bugfixes

* Fixed port reconnect error
* Fixed token refresh interval when new token added
* Fixed ui crash on broken nft items

### 0.3.12 (2022-12-26)

Features

* Added `executorParams` support (`everscale-inpage-provider@0.3.47`)
* Added ledger-app v1.0.6 support

Bugfixes

* Fixed local executor

### 0.3.11 (2022-12-08)

Features

* Added Multisig 2.1

Bugfixes

* Fixed disabled submit button in approval in some cases

### 0.3.10 (2022-12-05)

Features

* Display multisig required confirmations number

Bugfixes

* Fixed account data refresh after seed change
* Fixed account visibility bug after account removal
* Fixed redundant account creation in some cases
* Fixed multisig transaction status display
* Fixed extension crash after update
* Minor layout fixes

### 0.3.9 (2022-11-16)

Features

* Added NFT support
* Added the ability to delete seed
* USDT prices

Bugfixes

* Remove invalid tokens on startup
* Performance issues

### 0.3.8 (2022-11-01)

Bugfixes

* Fixed crash on optional payload params display

### 0.3.7 (2022-10-28)

Bugfixes

* Fixed api request cache
* Fixed inpage script global scope conflicts
* Fixed approval window connecting to iframe

### 0.3.6 (2022-10-24)

Bugfixes

* Fixed local node connection test

### 0.3.5 (2022-10-21)

Features

* Added phishing detection
* Added ability to switch network after connection error

Bugfixes

* Fixed contract interaction approval disabled button
* Fixed stacking banner click

### 0.3.4 (2022-10-10)

Features

* Added DeNS support
* Added Simple Liquid Staking
* Added "Buy EVER" button

### 0.2.36 (2022-09-20)

Features

* Changed default contract types.
* Reworked onboarding screens.

Bugfixes

* Fixed var int encoding.
* Fixed mapping entries order.
* Fixed subscriptions.

### 0.2.35 (2022-09-09)

Features

* Changed default GQL endpoints.
* Added RFLD network.
* Allow specifying ABI version in `packIntoCell` and `unpackFromCell`.
* Added `findTransaction` method to the provider api.

### 0.2.34 (2022-08-09)

Security fix

### 0.2.33 (2022-08-05)

Features

* Added support for ABI 2.3.
* Allow guessing method/event in `decodeInput`, `decodeEvent`, `decodeOutput`, `decodeTransaction`.
* Added `networkId` to the `getProviderState` method and `networkChanged` notification.
* Added `sendMessageDelayed` and `sendExternalMessageDelayed` methods to the provider api.

### 0.2.32 (2022-05-24)

Features

* Added passwords cache. If enabled, password for each seed will be saved for 30 minutes in the secure runtime cache.
  Can be enabled in `Manage seeds & accounts` panel.

### 0.2.31 (2022-05-01)

Bugfixes

* Fixed Ledger app connection (still in beta)
* Fixed gql endpoint selection

### 0.2.30 (2022-04-01)

Features

* Added Korean localisation

Bugfixes

* Fixed multisig transaction expiration label
* Fixed transaction explorer link

### 0.2.29 (2022-03-24)

Bugfixes

* Fixed multisig transactions

### 0.2.28 (2022-03-23)

Bugfixes

* Fixed recipient in the token transaction details popup
* Fixed potential panics in cells deserialization
* Fixed `Waiting for confirmation` label for multisig transactions with `reqConfirms: 0`
* Fixed restore for external accounts

### 0.2.27 (2022-03-01)

Features

* Added initial Ledger support
* Added support for external `SetcodeMultisig24h`

Bugfixes

* Fixed token transfer transaction info
* Fixed explorer links

### 0.2.26 (2022-02-11)

Features

* Added support for new TIP3.1 tokens standard
* Added `encryptData` and `decryptData` methods to provider api

### 0.2.25 (2022-01-08)

Features

* Finally, rework GQL transport
* Added Firefox browser support
* Additionally inject `__ever` object into pages. (`ton` object will be removed soon due to blockchain renaming)
* Added `getTransaction` and `getAccountsByCodeHash` methods to provider api

### 0.2.24 (2021-12-26)

Features

* Replace API for `ADNL RPC` to work with Rust nodes

## Changelog

### 0.2.23 (2021-12-04)

Rename TON to EVER. `TON Crystal Wallet` is now `EVER Wallet`

Bugfixes

* Fixed `addAsset` provider method.

### 0.2.22 (2021-12-04)

Bugfixes

* Minor endpoints fixes

### 0.2.21 (2021-11-26)

Features

* Added `changeAccount` method to provider api.

### 0.2.20 (2021-11-23)

Features

* Extended message model in provider API

Bugfixes

* Fixed account state decoding
* Fixed origin metadata

### 0.2.19 (2021-11-10)

Features

* Added `getBocHash` and `signDataRaw` methods to provider api.

Bugfixes

* Fixed white screen for invalid public key on `signData`.
* Fixed consecutive approval windows.
* Swap high and low bytes in signed data.

### 0.2.18 (2021-10-29)

Features

* Reworked internal application clock. It now can work with incorrect system time.
* Optimized WASM bundle size

Bugfixes

* Fixed incorrect start behaviour after unsuccessful addition of an external account.

### 0.2.17 (2021-10-12)

Bugfixes

* Fixed zerostate accounts management (added special handlers for `-1:777..`, `-1:888..` and `-1:999..`)

### 0.2.16 (2021-10-09)

Bugfixes

* Minor UI and provider fixes

### 0.2.15 (2021-10-05)

Features

* Added local node support
* Added `signData` and `addAsset` approval windows (use `ton-inpage-provider@^0.1.28`)
* Added `verifySignature` and `sendUnsignedExternalMessage` methods to provider api

Bugfixes

* Fixed mapping keys parsing in provider api

### 0.2.14 (2021-09-20)

Features

* Added bridge multisig support

Bugfixes

* Fixed CVE-2021-3757, CVE-2021-3749, CVE-2021-23436 in dependencies

### 0.2.13 (2021-09-11)

Minor fixes

### 0.2.12 (2021-09-10)

Features

* Added support for local `sendExternalMessage` execution
* Added `exitCode` to transactions model

Bugfixes

* Fixed empty ADNL transactions response

### 0.2.11 (2021-09-02)

Minor fixes

### 0.2.10 (2021-09-01)

Features

* Added support for ABI 2.1
* Reworked key creation window

Bugfixes

* Fixed password visibility in confirmation popup

### 0.2.9 (2021-08-25)

Bugfixes

* Fixed saving the selected connection id

### 0.2.8 (2021-08-24)

Security

* Fixed CVE-2021-23343 in dependencies

### 0.2.7 (2021-08-19)

Bugfixes

* Fixed network selection for broken connections

### 0.2.6 (2021-08-17)

Bugfixes

* Fixed next account id selection
* Fixed default account name
* Fixed error label while importing seed

### 0.2.5 (2021-08-15)

Bugfixes

* Fixed balance in assets list for tokens with zero decimals

### 0.2.4 (2021-08-14)

Bugfixes

* Fixed abi parsing in provider middleware
* Fixed masterchain accounts import

### 0.2.3 (2021-08-11)

Bugfixes

* Fixed parsing of bounced TIP3 messages (finally)

### 0.2.2 (2021-07-29)

Bugfixes

* Fixed bounce flag usage for `sendMessage` provider method

### 0.2.1 (2021-07-21)

Bugfixes

* Fixed fee calculation for `sendMessage` approval
* Fixed parsing of bounced TIP3 messages

### 0.2.0 (2021-07-14)

Features

* Reworked accounts flow
* Added full multisig flow support
* Show pending transactions in history
* Rework network selection
* Added missing seed exporting feature

Bugfixes

* Fixed annoying transaction popup
* Fixed window closing on focus lost (by using separate windows for each complex form)

### 0.1.12 (2021-06-28)

Features

* Added `extractPublicKey`, `codeToTvc` and `splitTvc` methods to the provider api.
* Optimized transactions for multisig wallets with one custodian.

### 0.1.11 (2021-06-21)

Bugfixes

* Fixed external function call.
* Fixed contract interaction popup.
* Fixed fetching history with non-ordinary transactions.

### 0.1.10 (2021-06-07)

Bugfixes

* Fixed initial migration.
* Fixed initial account selection.

### 0.1.9 (2021-06-04)

Bugfixes

* Fixed automatic network selection logic.

### 0.1.8 (2021-06-02)

Features

* Added waiting for background script in the popup.
* Iterate over all possible transports in selected network group until a working one is found.

Bugfixes

* Fixed selected network persistence.
* Fixed token transactions preloading

### 0.1.7 (2021-06-01)

Features

* Added support for both base64 and base64 url-safe addresses.
* Added support for ADNL RPC API, it can now be used in some cases when https://main.ton.dev/graphql is down.
* Added old transactions preloading.

Bugfixes:

* Performance issues in transactions list.
* Fixed network switch.

### 0.1.6 (2021-05-22)

Features:

* Added `packIntoCell` and `unpackFromCell` methods to the provider api.
* Added support for base64 encoded BOC in message comments.

Bugfixes:

* Fixed hex numbers in provider api (finally).
* Fixed potential connection error.

### 0.1.5 (2021-05-19)

Features:

* Added support for [TIP3v4](https://github.com/broxus/ton-eth-bridge-token-contracts/releases/tag/4.0)

Bugfixes:

* Fixed hex numbers in provider api.
* Fixed strange behavior on sites from atlassian.

### 0.1.4 (2021-05-17)

Features:

* Added network switch.
* Added `decodeEvent` and `decodeTransactionEvents` methods to the provider api.
* Added `version` for provider api `getProviderState` method response.
* Changed provider api `getTransactions` method.

Bugfixes:

* Fixed `cachedState` param for provider api `runLocal` method.
* Fixed `decodeTransaction` on function calls with outputs.

### 0.1.3 (2021-05-15)

Features:

* Added `Notify receiver` checkbox for token transfer.
* Added version label to account modal.

Bugfixes:

* Fixed password input for duplicated words.
* Hide `Send` button for empty WalletV3.
* Fixed public key label in account card.

### 0.1.2 (2021-05-14)

Bugfixes:

* Fixed wasm-bindgen module resolution.
* Fixed outdated wasm-pack.
* Fixed memory leaks due to invalid allocator.

### 0.1.1 (2021-05-13)

Bugfixes:

* Fixed early exit from web3 subscription in case of error.

### 0.1.0 (2021-05-12)

Initial release

* Single account.
* TON wallet support.
* TIP-3 tokens support ([Broxus TIP3v3.1](https://github.com/broxus/ton-eth-bridge-token-contracts/releases/tag/3.1))
* Web3-like interface ([everscale-inpage-provider](https://github.com/broxus/everscale-inpage-provider))
