export const StTychoVaultAbi = {
    'ABI version': 2,
    version: '2.2',
    header: ['pubkey', 'time', 'expire'],
    functions: [
        {
            name: 'constructor',
            inputs: [
                { name: '_owner', type: 'address' },
                { name: '_gainFee', type: 'uint128' },
                { name: '_stEverFeePercent', type: 'uint32' },
                { name: '_stTokenRoot', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'deposit',
            inputs: [
                { name: '_amount', type: 'uint128' },
                { name: '_nonce', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onAcceptTokensTransfer',
            inputs: [
                { name: 'value0', type: 'address' },
                { name: '_amount', type: 'uint128' },
                { name: '_sender', type: 'address' },
                { name: 'value3', type: 'address' },
                { name: '_remainingGasTo', type: 'address' },
                { name: '_payload', type: 'cell' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onPendingWithdrawAccepted',
            inputs: [
                { name: '_nonce', type: 'uint64' },
                { name: '_user', type: 'address' },
                { name: '_remainingGasTo', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onPendingWithdrawRejected',
            inputs: [
                { name: '_nonce', type: 'uint64' },
                { name: '_user', type: 'address' },
                { name: '_amount', type: 'uint128' },
                { name: '_remainingGasTo', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'removePendingWithdraw',
            inputs: [
                { name: '_nonce', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onPendingWithdrawRemoved',
            inputs: [
                { name: '_user', type: 'address' },
                { name: '_nonce', type: 'uint64' },
                { name: '_amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'processSendToUsers',
            inputs: [
                { components: [{ name: 'nonces', type: 'uint64[]' }], name: 'sendConfig', type: 'map(address,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'withdrawToUser',
            inputs: [
                { name: '_amount', type: 'uint128' },
                { name: '_user', type: 'address' },
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'timestamp', type: 'uint64' }, { name: 'unlockTime', type: 'uint64' }], name: '_withdrawals', type: 'map(uint64,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onAcceptTokensBurn',
            inputs: [
                { name: 'value0', type: 'uint128' },
                { name: 'value1', type: 'address' },
                { name: '_wallet', type: 'address' },
                { name: 'value3', type: 'address' },
                { name: '_payload', type: 'cell' },
            ],
            outputs: [
            ],
        },
        {
            name: 'withdrawStEverFee',
            inputs: [
                { name: '_amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'withdrawExtraEver',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'upgrade',
            inputs: [
                { name: '_newCode', type: 'cell' },
                { name: '_newVersion', type: 'uint32' },
                { name: '_sendGasTo', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'validateDepositRequest',
            inputs: [
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'fee', type: 'uint128' }], name: '_depositConfigs', type: 'map(address,tuple)' },
                { name: '_gasPrice', type: 'uint128' },
            ],
            outputs: [
                { components: [{ name: 'strategy', type: 'address' }, { name: 'errCode', type: 'uint16' }], name: 'value0', type: 'tuple[]' },
            ],
        },
        {
            name: 'validateWithdrawFromStrategiesRequest',
            inputs: [
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'fee', type: 'uint128' }], name: '_withdrawConfig', type: 'map(address,tuple)' },
            ],
            outputs: [
                { components: [{ name: 'strategy', type: 'address' }, { name: 'errCode', type: 'uint16' }], name: 'value0', type: 'tuple[]' },
            ],
        },
        {
            name: 'depositToStrategies',
            inputs: [
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'fee', type: 'uint128' }], name: '_depositConfigs', type: 'map(address,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onStrategyHandledDeposit',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'onStrategyDidntHandleDeposit',
            inputs: [
                { name: '_errcode', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'strategyReport',
            inputs: [
                { name: '_gain', type: 'uint128' },
                { name: '_loss', type: 'uint128' },
                { name: '_totalAssets', type: 'uint128' },
                { name: '_requestedBalance', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'processWithdrawFromStrategies',
            inputs: [
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'fee', type: 'uint128' }], name: '_withdrawConfig', type: 'map(address,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onStrategyHandledWithdrawRequest',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'forceWithdrawFromStrategies',
            inputs: [
                { components: [{ name: 'amount', type: 'uint128' }, { name: 'fee', type: 'uint128' }], name: '_withdrawConfig', type: 'map(address,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'receiveFromStrategy',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'receiveAdditionalTransferFromStrategy',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'withdrawFromStrategyError',
            inputs: [
                { name: '_errcode', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'processWithdrawExtraMoneyFromStrategies',
            inputs: [
                { name: '_strategies', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: 'receiveExtraMoneyFromStrategy',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'forceStrategyRemove',
            inputs: [
                { name: '_strategy', type: 'address' },
                { name: '_cluster', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'createCluster',
            inputs: [
                { name: '_clusterOwner', type: 'address' },
                { name: '_assurance', type: 'uint128' },
                { name: '_maxStrategiesCount', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onClusterRemoved',
            inputs: [
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterNonce', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'addStrategies',
            inputs: [
                { name: '_strategies', type: 'address[]' },
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterId', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'removeStrategies',
            inputs: [
                { name: '_strategies', type: 'address[]' },
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterId', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: '_removeStrategy',
            inputs: [
                { name: '_strategy', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onStrategiesDelegationHandled',
            inputs: [
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterNonce', type: 'uint32' },
                { name: '_strategies', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: 'isEmergencyProcess',
            inputs: [
            ],
            outputs: [
                { name: 'value0', type: 'bool' },
            ],
        },
        {
            name: 'startEmergencyProcess',
            inputs: [
                { name: '_proofNonce', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'stopEmergencyProcess',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'startEmergencyRejected',
            inputs: [
                { name: '_user', type: 'address' },
                { name: 'errcode', type: 'uint16' },
            ],
            outputs: [
            ],
        },
        {
            name: 'emergencyWithdrawFromStrategiesProcess',
            inputs: [
                { name: '_user', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: '_processEmergencyWithdrawFromStrategy',
            inputs: [
                { name: '_user', type: 'address' },
                { components: [{ name: 'value0', type: 'address' }, { components: [{ name: 'lastReport', type: 'uint128' }, { name: 'totalGain', type: 'uint128' }, { name: 'depositingAmount', type: 'uint128' }, { name: 'withdrawingAmount', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }, { name: 'cluster', type: 'address' }, { name: 'state', type: 'uint8' }], name: 'value1', type: 'tuple' }], name: '_startPair', type: 'optional(tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'changeEmergencyPauseState',
            inputs: [
                { name: '_isPaused', type: 'bool' },
            ],
            outputs: [
            ],
        },
        {
            name: 'emergencyWithdrawToUser',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'transferOwnership',
            inputs: [
                { name: '_newOwner', type: 'address' },
                { name: '_sendGasTo', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'self_setStEverOwnerForClusters',
            inputs: [
                { name: '_sendGasTo', type: 'address' },
                { components: [{ name: 'currentClusterNonce', type: 'uint32' }, { name: 'clusters', type: 'map(uint32,address)' }], name: '_clusterPools', type: 'map(address,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'transferGovernance',
            inputs: [
                { name: '_newGovernance', type: 'uint256' },
                { name: '_sendGasTo', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'receiveTokenWalletAddress',
            inputs: [
                { name: '_wallet', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setGainFee',
            inputs: [
                { name: '_gainFee', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setMinStrategyDepositValue',
            inputs: [
                { name: '_minStrategyDepositValue', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setMinStrategyWithdrawValue',
            inputs: [
                { name: '_minStrategyWithdrawValue', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setStEverFeePercent',
            inputs: [
                { name: '_stEverFeePercent', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setIsPaused',
            inputs: [
                { name: '_isPaused', type: 'bool' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setStrategyFactory',
            inputs: [
                { name: '_strategyFactory', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setWithdrawHoldTimeInSeconds',
            inputs: [
                { name: '_holdTime', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setFullUnlockRewardSeconds',
            inputs: [
                { name: '_fullUnlockSeconds', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'setTimeAfterEmergencyCanBeActivated',
            inputs: [
                { name: '_newTimeAfterEmergencyCanBeActivated', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'encodeDepositPayload',
            inputs: [
                { name: '_nonce', type: 'uint64' },
            ],
            outputs: [
                { name: 'depositPayload', type: 'cell' },
            ],
        },
        {
            name: 'decodeDepositPayload',
            inputs: [
                { name: '_payload', type: 'cell' },
            ],
            outputs: [
                { name: 'nonce', type: 'uint64' },
                { name: 'correct', type: 'bool' },
            ],
        },
        {
            name: 'getDepositStEverAmount',
            inputs: [
                { name: '_amount', type: 'uint128' },
            ],
            outputs: [
                { name: 'value0', type: 'uint128' },
            ],
        },
        {
            name: 'getWithdrawEverAmount',
            inputs: [
                { name: '_amount', type: 'uint128' },
            ],
            outputs: [
                { name: 'value0', type: 'uint128' },
            ],
        },
        {
            name: 'getDepositStEverAmountFor',
            inputs: [
                { name: '_amount', type: 'uint128' },
                { name: '_time', type: 'uint128' },
            ],
            outputs: [
                { name: 'value0', type: 'uint128' },
            ],
        },
        {
            name: 'getWithdrawEverAmountFor',
            inputs: [
                { name: '_amount', type: 'uint128' },
                { name: '_time', type: 'uint128' },
            ],
            outputs: [
                { name: 'value0', type: 'uint128' },
            ],
        },
        {
            name: 'getLockStateFor',
            inputs: [
                { name: 'time', type: 'uint128' },
            ],
            outputs: [
                { name: '_remainingLockedAssets', type: 'uint128' },
                { name: '_remainingSeconds', type: 'uint128' },
                { name: '_effectiveEverAssets', type: 'uint128' },
            ],
        },
        {
            name: 'getAccountAddress',
            inputs: [
                { name: 'answerId', type: 'uint32' },
                { name: '_user', type: 'address' },
            ],
            outputs: [
                { name: 'value0', type: 'address' },
            ],
        },
        {
            name: 'setNewAccountCode',
            inputs: [
                { name: '_newAccountCode', type: 'cell' },
            ],
            outputs: [
            ],
        },
        {
            name: 'upgradeStEverAccount',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'upgradeStEverAccounts',
            inputs: [
                { name: '_sendGasTo', type: 'address' },
                { name: '_users', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: '_upgradeStEverAccounts',
            inputs: [
                { name: '_sendGasTo', type: 'address' },
                { name: '_users', type: 'address[]' },
                { name: '_startIdx', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onAccountUpgraded',
            inputs: [
                { name: '_user', type: 'address' },
                { name: '_sendGasTo', type: 'address' },
                { name: '_newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'getClusterAddress',
            inputs: [
                { name: 'answerId', type: 'uint32' },
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterNonce', type: 'uint32' },
            ],
            outputs: [
                { name: 'value0', type: 'address' },
            ],
        },
        {
            name: 'setNewClusterCode',
            inputs: [
                { name: '_newClusterCode', type: 'cell' },
            ],
            outputs: [
            ],
        },
        {
            name: 'upgradeStEverCluster',
            inputs: [
                { name: '_clusterNonce', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'upgradeStEverClusters',
            inputs: [
                { name: '_sendGasTo', type: 'address' },
                { name: '_clusters', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: '_upgradeStEverClusters',
            inputs: [
                { name: '_sendGasTo', type: 'address' },
                { name: '_clusters', type: 'address[]' },
                { name: '_startIdx', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'onClusterUpgraded',
            inputs: [
                { name: '_clusterOwner', type: 'address' },
                { name: '_clusterNonce', type: 'uint32' },
                { name: '_sendGasTo', type: 'address' },
                { name: '_newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'getDetails',
            inputs: [
                { name: 'answerId', type: 'uint32' },
            ],
            outputs: [
                { components: [{ name: 'nonce', type: 'uint128' }, { name: 'governance', type: 'uint256' }, { name: 'stEverSupply', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }, { name: 'availableAssets', type: 'uint128' }, { name: 'totalStEverFee', type: 'uint128' }, { name: 'effectiveEverAssets', type: 'uint128' }, { name: 'remainingLockedAssets', type: 'uint128' }, { name: 'unlockPerSecond', type: 'uint128' }, { name: 'stEverWallet', type: 'address' }, { name: 'stTokenRoot', type: 'address' }, { name: 'lastUnlockTime', type: 'uint64' }, { name: 'fullUnlockSeconds', type: 'uint128' }, { name: 'remainingSeconds', type: 'uint128' }, { name: 'gainFee', type: 'uint128' }, { name: 'stEverFeePercent', type: 'uint32' }, { name: 'minStrategyDepositValue', type: 'uint128' }, { name: 'minStrategyWithdrawValue', type: 'uint128' }, { name: 'isPaused', type: 'bool' }, { name: 'strategyFactory', type: 'address' }, { name: 'withdrawHoldTime', type: 'uint64' }, { name: 'owner', type: 'address' }, { name: 'accountVersion', type: 'uint32' }, { name: 'stEverVaultVersion', type: 'uint32' }, { name: 'clusterVersion', type: 'uint32' }, { name: 'timeAfterEmergencyCanBeActivated', type: 'uint64' }, { components: [{ name: 'isEmergency', type: 'bool' }, { name: 'isPaused', type: 'bool' }, { name: 'emitter', type: 'address' }, { name: 'emitTimestamp', type: 'uint64' }], name: 'emergencyState', type: 'tuple' }], name: 'value0', type: 'tuple' },
            ],
        },
        {
            name: 'nonce',
            inputs: [
            ],
            outputs: [
                { name: 'nonce', type: 'uint128' },
            ],
        },
        {
            name: 'strategies',
            inputs: [
            ],
            outputs: [
                { components: [{ name: 'lastReport', type: 'uint128' }, { name: 'totalGain', type: 'uint128' }, { name: 'depositingAmount', type: 'uint128' }, { name: 'withdrawingAmount', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }, { name: 'cluster', type: 'address' }, { name: 'state', type: 'uint8' }], name: 'strategies', type: 'map(address,tuple)' },
            ],
        },
        {
            name: 'clusterPools',
            inputs: [
            ],
            outputs: [
                { components: [{ name: 'currentClusterNonce', type: 'uint32' }, { name: 'clusters', type: 'map(uint32,address)' }], name: 'clusterPools', type: 'map(address,tuple)' },
            ],
        },
    ],
    data: [
        { key: 1, name: 'nonce', type: 'uint128' },
        { key: 2, name: 'governance', type: 'uint256' },
        { key: 3, name: 'platformCode', type: 'cell' },
        { key: 4, name: 'accountCode', type: 'cell' },
        { key: 5, name: 'clusterCode', type: 'cell' },
    ],
    events: [
        {
            name: 'PausedStateChanged',
            inputs: [
                { name: 'pauseState', type: 'bool' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyFactoryAddressUpdated',
            inputs: [
                { name: '_strategyFactory', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawHoldTimeUpdated',
            inputs: [
                { name: 'withdrawHoldTimeSeconds', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'FullUnlockTimeUpdated',
            inputs: [
                { name: 'fullUnlockTimeSeconds', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'TimeAfterEmergencyCanBeActivatedValueUpdated',
            inputs: [
                { name: 'timeAfterEmergencyCanBeActivated', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategiesAdded',
            inputs: [
                { name: 'strategy', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyRemoved',
            inputs: [
                { name: 'strategy', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategiesPendingRemove',
            inputs: [
                { name: 'strategies', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyReported',
            inputs: [
                { name: 'strategy', type: 'address' },
                { components: [{ name: 'gain', type: 'uint128' }, { name: 'loss', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }], name: 'report', type: 'tuple' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ClusterCreated',
            inputs: [
                { name: 'clusterOwner', type: 'address' },
                { name: 'assurance', type: 'uint128' },
                { name: 'maxStrategiesCount', type: 'uint32' },
                { name: 'cluster', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ClusterHandledStrategiesDelegation',
            inputs: [
                { name: 'cluster', type: 'address' },
                { name: 'clusterOwner', type: 'address' },
                { name: 'clusterNonce', type: 'uint32' },
                { name: '_strategies', type: 'address[]' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ClusterRemoving',
            inputs: [
                { name: 'cluster', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ClusterRemoved',
            inputs: [
                { name: 'cluster', type: 'address' },
                { name: 'clusterOwner', type: 'address' },
                { name: 'clusterNonce', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyHandledDeposit',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'depositValue', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyDidntHandleDeposit',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'errcode', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ProcessDepositToStrategyError',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'errcode', type: 'uint16' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyHandledWithdrawRequest',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyWithdrawSuccess',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'StrategyWithdrawError',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'errcode', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ProcessWithdrawFromStrategyError',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'errcode', type: 'uint16' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ReceiveAdditionalTransferFromStrategy',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ProcessWithdrawExtraMoneyFromStrategyError',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'ercode', type: 'uint16' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ReceiveExtraMoneyFromStrategy',
            inputs: [
                { name: 'strategy', type: 'address' },
                { name: 'value', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'SuccessWithdrawExtraEver',
            inputs: [
                { name: 'value', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'Deposit',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'depositAmount', type: 'uint128' },
                { name: 'receivedStEvers', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawRequest',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'amount', type: 'uint128' },
                { name: 'unlockTime', type: 'uint64' },
                { name: 'nonce', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawRequestRemoved',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'nonce', type: 'uint64' },
            ],
            outputs: [
            ],
        },
        {
            name: 'BadWithdrawRequest',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'amount', type: 'uint128' },
                { name: 'attachedValue', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawError',
            inputs: [
                { name: 'user', type: 'address' },
                { components: [{ name: 'stEverAmount', type: 'uint128' }, { name: 'everAmount', type: 'uint128' }, { name: 'unlockTime', type: 'uint64' }], name: 'withdrawInfo', type: 'map(uint64,tuple)' },
                { name: 'amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawSuccess',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'amount', type: 'uint128' },
                { components: [{ name: 'stEverAmount', type: 'uint128' }, { name: 'everAmount', type: 'uint128' }, { name: 'unlockTime', type: 'uint64' }], name: 'withdrawInfo', type: 'map(uint64,tuple)' },
            ],
            outputs: [
            ],
        },
        {
            name: 'NewAccountCodeSet',
            inputs: [
                { name: 'newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'AccountUpgraded',
            inputs: [
                { name: 'user', type: 'address' },
                { name: 'newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'NewClusterCodeSet',
            inputs: [
                { name: 'newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'ClusterUpgraded',
            inputs: [
                { name: 'clusterOwner', type: 'address' },
                { name: 'clusterNonce', type: 'uint32' },
                { name: 'newVersion', type: 'uint32' },
            ],
            outputs: [
            ],
        },
        {
            name: 'EmergencyProcessStarted',
            inputs: [
                { name: 'emitter', type: 'address' },
            ],
            outputs: [
            ],
        },
        {
            name: 'EmergencyProcessRejectedByAccount',
            inputs: [
                { name: 'emitter', type: 'address' },
                { name: 'errcode', type: 'uint16' },
            ],
            outputs: [
            ],
        },
        {
            name: 'EmergencyStatePaused',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'EmergencyStateContinued',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'EmergencyStopped',
            inputs: [
            ],
            outputs: [
            ],
        },
        {
            name: 'WithdrawFee',
            inputs: [
                { name: 'amount', type: 'uint128' },
            ],
            outputs: [
            ],
        },
    ],
    fields: [
        { name: '_pubkey', type: 'uint256' },
        { name: '_timestamp', type: 'uint64' },
        { name: '_constructorFlag', type: 'bool' },
        { name: 'nonce', type: 'uint128' },
        { name: 'governance', type: 'uint256' },
        { name: 'platformCode', type: 'cell' },
        { name: 'accountCode', type: 'cell' },
        { name: 'clusterCode', type: 'cell' },
        { name: 'stEverSupply', type: 'uint128' },
        { name: 'totalAssets', type: 'uint128' },
        { name: 'availableAssets', type: 'uint128' },
        { name: 'totalStEverFee', type: 'uint128' },
        { name: 'effectiveEverAssets', type: 'uint128' },
        { name: 'remainingLockedAssets', type: 'uint128' },
        { name: 'unlockPerSecond', type: 'uint128' },
        { name: 'stEverWallet', type: 'address' },
        { name: 'stTokenRoot', type: 'address' },
        { name: 'lastUnlockTime', type: 'uint64' },
        { name: 'fullUnlockSeconds', type: 'uint128' },
        { name: 'remainingSeconds', type: 'uint128' },
        { name: 'gainFee', type: 'uint128' },
        { name: 'stEverFeePercent', type: 'uint32' },
        { name: 'minStrategyDepositValue', type: 'uint128' },
        { name: 'minStrategyWithdrawValue', type: 'uint128' },
        { name: 'isPaused', type: 'bool' },
        { name: 'strategyFactory', type: 'address' },
        { name: 'withdrawHoldTime', type: 'uint64' },
        { name: 'owner', type: 'address' },
        { name: 'accountVersion', type: 'uint32' },
        { name: 'stEverVaultVersion', type: 'uint32' },
        { name: 'clusterVersion', type: 'uint32' },
        { components: [{ name: 'lastReport', type: 'uint128' }, { name: 'totalGain', type: 'uint128' }, { name: 'depositingAmount', type: 'uint128' }, { name: 'withdrawingAmount', type: 'uint128' }, { name: 'totalAssets', type: 'uint128' }, { name: 'cluster', type: 'address' }, { name: 'state', type: 'uint8' }], name: 'strategies', type: 'map(address,tuple)' },
        { components: [{ name: 'currentClusterNonce', type: 'uint32' }, { name: 'clusters', type: 'map(uint32,address)' }], name: 'clusterPools', type: 'map(address,tuple)' },
        { components: [{ name: 'amount', type: 'uint128' }, { name: 'user', type: 'address' }, { name: 'remainingGasTo', type: 'address' }, { name: 'unlockTime', type: 'uint64' }], name: 'pendingWithdrawals', type: 'map(uint64,tuple)' },
        { components: [{ name: 'isEmergency', type: 'bool' }, { name: 'isPaused', type: 'bool' }, { name: 'emitter', type: 'address' }, { name: 'emitTimestamp', type: 'uint64' }], name: 'emergencyState', type: 'tuple' },
        { name: 'timeAfterEmergencyCanBeActivated', type: 'uint64' },
    ],
} as const
