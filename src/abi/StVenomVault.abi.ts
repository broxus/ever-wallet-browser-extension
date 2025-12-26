export const StVenomVaultAbi = {
    "ABI version": 2,
    "data": [
        {
            "key": 1,
            "name": "nonce",
            "type": "uint128"
        },
        {
            "key": 2,
            "name": "governance",
            "type": "uint256"
        },
        {
            "key": 3,
            "name": "platformCode",
            "type": "cell"
        },
        {
            "key": 4,
            "name": "accountCode",
            "type": "cell"
        },
        {
            "key": 5,
            "name": "clusterCode",
            "type": "cell"
        }
    ],
    "events": [
        {
            "inputs": [
                {
                    "name": "pauseState",
                    "type": "bool"
                }
            ],
            "name": "PausedStateChanged",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategyFactory",
                    "type": "address"
                }
            ],
            "name": "StrategyFactoryAddressUpdated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "withdrawHoldTimeSeconds",
                    "type": "uint64"
                }
            ],
            "name": "WithdrawHoldTimeUpdated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "fullUnlockTimeSeconds",
                    "type": "uint128"
                }
            ],
            "name": "FullUnlockTimeUpdated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "timeAfterEmergencyCanBeActivated",
                    "type": "uint64"
                }
            ],
            "name": "TimeAfterEmergencyCanBeActivatedValueUpdated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address[]"
                }
            ],
            "name": "StrategiesAdded",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                }
            ],
            "name": "StrategyRemoved",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategies",
                    "type": "address[]"
                }
            ],
            "name": "StrategiesPendingRemove",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "name": "gain",
                            "type": "uint128"
                        },
                        {
                            "name": "loss",
                            "type": "uint128"
                        },
                        {
                            "name": "totalAssets",
                            "type": "uint128"
                        }
                    ],
                    "name": "report",
                    "type": "tuple"
                }
            ],
            "name": "StrategyReported",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "clusterOwner",
                    "type": "address"
                },
                {
                    "name": "assurance",
                    "type": "uint128"
                },
                {
                    "name": "maxStrategiesCount",
                    "type": "uint32"
                },
                {
                    "name": "cluster",
                    "type": "address"
                }
            ],
            "name": "ClusterCreated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "cluster",
                    "type": "address"
                },
                {
                    "name": "clusterOwner",
                    "type": "address"
                },
                {
                    "name": "clusterNonce",
                    "type": "uint32"
                },
                {
                    "name": "_strategies",
                    "type": "address[]"
                }
            ],
            "name": "ClusterHandledStrategiesDelegation",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "cluster",
                    "type": "address"
                }
            ],
            "name": "ClusterRemoving",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "cluster",
                    "type": "address"
                },
                {
                    "name": "clusterOwner",
                    "type": "address"
                },
                {
                    "name": "clusterNonce",
                    "type": "uint32"
                }
            ],
            "name": "ClusterRemoved",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "depositValue",
                    "type": "uint128"
                }
            ],
            "name": "StrategyHandledDeposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint32"
                }
            ],
            "name": "StrategyDidntHandleDeposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint16"
                }
            ],
            "name": "ProcessDepositToStrategyError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                }
            ],
            "name": "StrategyHandledWithdrawRequest",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                }
            ],
            "name": "StrategyWithdrawSuccess",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint32"
                }
            ],
            "name": "StrategyWithdrawError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint16"
                }
            ],
            "name": "ProcessWithdrawFromStrategyError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                }
            ],
            "name": "ReceiveAdditionalTransferFromStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "ercode",
                    "type": "uint16"
                }
            ],
            "name": "ProcessWithdrawExtraMoneyFromStrategyError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "strategy",
                    "type": "address"
                },
                {
                    "name": "value",
                    "type": "uint128"
                }
            ],
            "name": "ReceiveExtraMoneyFromStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "value",
                    "type": "uint128"
                }
            ],
            "name": "SuccessWithdrawExtraEver",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "depositAmount",
                    "type": "uint128"
                },
                {
                    "name": "receivedStEvers",
                    "type": "uint128"
                }
            ],
            "name": "Deposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                },
                {
                    "name": "unlockTime",
                    "type": "uint64"
                },
                {
                    "name": "nonce",
                    "type": "uint64"
                }
            ],
            "name": "WithdrawRequest",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "nonce",
                    "type": "uint64"
                }
            ],
            "name": "WithdrawRequestRemoved",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                },
                {
                    "name": "attachedValue",
                    "type": "uint128"
                }
            ],
            "name": "BadWithdrawRequest",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "name": "stEverAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "everAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "unlockTime",
                            "type": "uint64"
                        }
                    ],
                    "name": "withdrawInfo",
                    "type": "map(uint64,tuple)"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                }
            ],
            "name": "WithdrawError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint128"
                },
                {
                    "components": [
                        {
                            "name": "stEverAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "everAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "unlockTime",
                            "type": "uint64"
                        }
                    ],
                    "name": "withdrawInfo",
                    "type": "map(uint64,tuple)"
                }
            ],
            "name": "WithdrawSuccess",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "newVersion",
                    "type": "uint32"
                }
            ],
            "name": "NewAccountCodeSet",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "newVersion",
                    "type": "uint32"
                }
            ],
            "name": "AccountUpgraded",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "newVersion",
                    "type": "uint32"
                }
            ],
            "name": "NewClusterCodeSet",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "clusterOwner",
                    "type": "address"
                },
                {
                    "name": "clusterNonce",
                    "type": "uint32"
                },
                {
                    "name": "newVersion",
                    "type": "uint32"
                }
            ],
            "name": "ClusterUpgraded",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "emitter",
                    "type": "address"
                }
            ],
            "name": "EmergencyProcessStarted",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "emitter",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint16"
                }
            ],
            "name": "EmergencyProcessRejectedByAccount",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "EmergencyStatePaused",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "EmergencyStateContinued",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "EmergencyStopped",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "amount",
                    "type": "uint128"
                }
            ],
            "name": "WithdrawFee",
            "outputs": []
        }
    ],
    "fields": [
        {
            "name": "_pubkey",
            "type": "uint256"
        },
        {
            "name": "_timestamp",
            "type": "uint64"
        },
        {
            "name": "_constructorFlag",
            "type": "bool"
        },
        {
            "name": "nonce",
            "type": "uint128"
        },
        {
            "name": "governance",
            "type": "uint256"
        },
        {
            "name": "platformCode",
            "type": "cell"
        },
        {
            "name": "accountCode",
            "type": "cell"
        },
        {
            "name": "clusterCode",
            "type": "cell"
        },
        {
            "name": "stEverSupply",
            "type": "uint128"
        },
        {
            "name": "totalAssets",
            "type": "uint128"
        },
        {
            "name": "availableAssets",
            "type": "uint128"
        },
        {
            "name": "totalStEverFee",
            "type": "uint128"
        },
        {
            "name": "effectiveEverAssets",
            "type": "uint128"
        },
        {
            "name": "remainingLockedAssets",
            "type": "uint128"
        },
        {
            "name": "unlockPerSecond",
            "type": "uint128"
        },
        {
            "name": "stEverWallet",
            "type": "address"
        },
        {
            "name": "stTokenRoot",
            "type": "address"
        },
        {
            "name": "lastUnlockTime",
            "type": "uint64"
        },
        {
            "name": "fullUnlockSeconds",
            "type": "uint128"
        },
        {
            "name": "remainingSeconds",
            "type": "uint128"
        },
        {
            "name": "gainFee",
            "type": "uint128"
        },
        {
            "name": "stEverFeePercent",
            "type": "uint32"
        },
        {
            "name": "minStrategyDepositValue",
            "type": "uint128"
        },
        {
            "name": "minStrategyWithdrawValue",
            "type": "uint128"
        },
        {
            "name": "isPaused",
            "type": "bool"
        },
        {
            "name": "strategyFactory",
            "type": "address"
        },
        {
            "name": "withdrawHoldTime",
            "type": "uint64"
        },
        {
            "name": "owner",
            "type": "address"
        },
        {
            "name": "accountVersion",
            "type": "uint32"
        },
        {
            "name": "stEverVaultVersion",
            "type": "uint32"
        },
        {
            "name": "clusterVersion",
            "type": "uint32"
        },
        {
            "components": [
                {
                    "name": "lastReport",
                    "type": "uint128"
                },
                {
                    "name": "totalGain",
                    "type": "uint128"
                },
                {
                    "name": "depositingAmount",
                    "type": "uint128"
                },
                {
                    "name": "withdrawingAmount",
                    "type": "uint128"
                },
                {
                    "name": "totalAssets",
                    "type": "uint128"
                },
                {
                    "name": "cluster",
                    "type": "address"
                },
                {
                    "name": "state",
                    "type": "uint8"
                }
            ],
            "name": "strategies",
            "type": "map(address,tuple)"
        },
        {
            "components": [
                {
                    "name": "currentClusterNonce",
                    "type": "uint32"
                },
                {
                    "name": "clusters",
                    "type": "map(uint32,address)"
                }
            ],
            "name": "clusterPools",
            "type": "map(address,tuple)"
        },
        {
            "components": [
                {
                    "name": "amount",
                    "type": "uint128"
                },
                {
                    "name": "user",
                    "type": "address"
                },
                {
                    "name": "remainingGasTo",
                    "type": "address"
                },
                {
                    "name": "unlockTime",
                    "type": "uint64"
                }
            ],
            "name": "pendingWithdrawals",
            "type": "map(uint64,tuple)"
        },
        {
            "components": [
                {
                    "name": "isEmergency",
                    "type": "bool"
                },
                {
                    "name": "isPaused",
                    "type": "bool"
                },
                {
                    "name": "emitter",
                    "type": "address"
                },
                {
                    "name": "emitTimestamp",
                    "type": "uint64"
                }
            ],
            "name": "emergencyState",
            "type": "tuple"
        },
        {
            "name": "timeAfterEmergencyCanBeActivated",
            "type": "uint64"
        }
    ],
    "functions": [
        {
            "inputs": [
                {
                    "name": "_owner",
                    "type": "address"
                },
                {
                    "name": "_gainFee",
                    "type": "uint128"
                },
                {
                    "name": "_stEverFeePercent",
                    "type": "uint32"
                },
                {
                    "name": "_stTokenRoot",
                    "type": "address"
                }
            ],
            "name": "constructor",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_nonce",
                    "type": "uint64"
                }
            ],
            "name": "deposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "value0",
                    "type": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_sender",
                    "type": "address"
                },
                {
                    "name": "value3",
                    "type": "address"
                },
                {
                    "name": "_remainingGasTo",
                    "type": "address"
                },
                {
                    "name": "_payload",
                    "type": "cell"
                }
            ],
            "name": "onAcceptTokensTransfer",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_nonce",
                    "type": "uint64"
                },
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "name": "_remainingGasTo",
                    "type": "address"
                }
            ],
            "name": "onPendingWithdrawAccepted",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_nonce",
                    "type": "uint64"
                },
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_remainingGasTo",
                    "type": "address"
                }
            ],
            "name": "onPendingWithdrawRejected",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_nonce",
                    "type": "uint64"
                }
            ],
            "name": "removePendingWithdraw",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "name": "_nonce",
                    "type": "uint64"
                },
                {
                    "name": "_amount",
                    "type": "uint128"
                }
            ],
            "name": "onPendingWithdrawRemoved",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "nonces",
                            "type": "uint64[]"
                        }
                    ],
                    "name": "sendConfig",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "processSendToUsers",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "timestamp",
                            "type": "uint64"
                        },
                        {
                            "name": "unlockTime",
                            "type": "uint64"
                        }
                    ],
                    "name": "_withdrawals",
                    "type": "map(uint64,tuple)"
                }
            ],
            "name": "withdrawToUser",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "value0",
                    "type": "uint128"
                },
                {
                    "name": "value1",
                    "type": "address"
                },
                {
                    "name": "_wallet",
                    "type": "address"
                },
                {
                    "name": "value3",
                    "type": "address"
                },
                {
                    "name": "_payload",
                    "type": "cell"
                }
            ],
            "name": "onAcceptTokensBurn",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                }
            ],
            "name": "withdrawStEverFee",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "withdrawExtraEver",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_newCode",
                    "type": "cell"
                },
                {
                    "name": "_newVersion",
                    "type": "uint32"
                },
                {
                    "name": "_sendGasTo",
                    "type": "address"
                }
            ],
            "name": "upgrade",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "fee",
                            "type": "uint128"
                        }
                    ],
                    "name": "_depositConfigs",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "validateDepositRequest",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "strategy",
                            "type": "address"
                        },
                        {
                            "name": "errCode",
                            "type": "uint16"
                        }
                    ],
                    "name": "value0",
                    "type": "tuple[]"
                }
            ]
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "fee",
                            "type": "uint128"
                        }
                    ],
                    "name": "_withdrawConfig",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "validateWithdrawFromStrategiesRequest",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "strategy",
                            "type": "address"
                        },
                        {
                            "name": "errCode",
                            "type": "uint16"
                        }
                    ],
                    "name": "value0",
                    "type": "tuple[]"
                }
            ]
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "fee",
                            "type": "uint128"
                        }
                    ],
                    "name": "_depositConfigs",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "depositToStrategies",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "onStrategyHandledDeposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_errcode",
                    "type": "uint32"
                }
            ],
            "name": "onStrategyDidntHandleDeposit",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_gain",
                    "type": "uint128"
                },
                {
                    "name": "_loss",
                    "type": "uint128"
                },
                {
                    "name": "_totalAssets",
                    "type": "uint128"
                },
                {
                    "name": "_requestedBalance",
                    "type": "uint128"
                }
            ],
            "name": "strategyReport",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "fee",
                            "type": "uint128"
                        }
                    ],
                    "name": "_withdrawConfig",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "processWithdrawFromStrategies",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "onStrategyHandledWithdrawRequest",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "components": [
                        {
                            "name": "amount",
                            "type": "uint128"
                        },
                        {
                            "name": "fee",
                            "type": "uint128"
                        }
                    ],
                    "name": "_withdrawConfig",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "forceWithdrawFromStrategies",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "receiveFromStrategy",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "receiveAdditionalTransferFromStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_errcode",
                    "type": "uint32"
                }
            ],
            "name": "withdrawFromStrategyError",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategies",
                    "type": "address[]"
                }
            ],
            "name": "processWithdrawExtraMoneyFromStrategies",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "receiveExtraMoneyFromStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategy",
                    "type": "address"
                },
                {
                    "name": "_cluster",
                    "type": "address"
                }
            ],
            "name": "forceStrategyRemove",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_assurance",
                    "type": "uint128"
                },
                {
                    "name": "_maxStrategiesCount",
                    "type": "uint32"
                }
            ],
            "name": "createCluster",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterNonce",
                    "type": "uint32"
                }
            ],
            "name": "onClusterRemoved",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategies",
                    "type": "address[]"
                },
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterId",
                    "type": "uint32"
                }
            ],
            "name": "addStrategies",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategies",
                    "type": "address[]"
                },
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterId",
                    "type": "uint32"
                }
            ],
            "name": "removeStrategies",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategy",
                    "type": "address"
                }
            ],
            "name": "_removeStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterNonce",
                    "type": "uint32"
                },
                {
                    "name": "_strategies",
                    "type": "address[]"
                }
            ],
            "name": "onStrategiesDelegationHandled",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "isEmergencyProcess",
            "outputs": [
                {
                    "name": "value0",
                    "type": "bool"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_proofNonce",
                    "type": "uint64"
                }
            ],
            "name": "startEmergencyProcess",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "stopEmergencyProcess",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "name": "errcode",
                    "type": "uint16"
                }
            ],
            "name": "startEmergencyRejected",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_user",
                    "type": "address"
                }
            ],
            "name": "emergencyWithdrawFromStrategiesProcess",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "name": "value0",
                            "type": "address"
                        },
                        {
                            "components": [
                                {
                                    "name": "lastReport",
                                    "type": "uint128"
                                },
                                {
                                    "name": "totalGain",
                                    "type": "uint128"
                                },
                                {
                                    "name": "depositingAmount",
                                    "type": "uint128"
                                },
                                {
                                    "name": "withdrawingAmount",
                                    "type": "uint128"
                                },
                                {
                                    "name": "totalAssets",
                                    "type": "uint128"
                                },
                                {
                                    "name": "cluster",
                                    "type": "address"
                                },
                                {
                                    "name": "state",
                                    "type": "uint8"
                                }
                            ],
                            "name": "value1",
                            "type": "tuple"
                        }
                    ],
                    "name": "_startPair",
                    "type": "optional(tuple)"
                }
            ],
            "name": "_processEmergencyWithdrawFromStrategy",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_isPaused",
                    "type": "bool"
                }
            ],
            "name": "changeEmergencyPauseState",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "emergencyWithdrawToUser",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_newOwner",
                    "type": "address"
                },
                {
                    "name": "_sendGasTo",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "components": [
                        {
                            "name": "currentClusterNonce",
                            "type": "uint32"
                        },
                        {
                            "name": "clusters",
                            "type": "map(uint32,address)"
                        }
                    ],
                    "name": "_clusterPools",
                    "type": "map(address,tuple)"
                }
            ],
            "name": "self_setStEverOwnerForClusters",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_newGovernance",
                    "type": "uint256"
                },
                {
                    "name": "_sendGasTo",
                    "type": "address"
                }
            ],
            "name": "transferGovernance",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_wallet",
                    "type": "address"
                }
            ],
            "name": "receiveTokenWalletAddress",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_gainFee",
                    "type": "uint128"
                }
            ],
            "name": "setGainFee",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_minStrategyDepositValue",
                    "type": "uint128"
                }
            ],
            "name": "setMinStrategyDepositValue",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_minStrategyWithdrawValue",
                    "type": "uint128"
                }
            ],
            "name": "setMinStrategyWithdrawValue",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_stEverFeePercent",
                    "type": "uint32"
                }
            ],
            "name": "setStEverFeePercent",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_isPaused",
                    "type": "bool"
                }
            ],
            "name": "setIsPaused",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_strategyFactory",
                    "type": "address"
                }
            ],
            "name": "setStrategyFactory",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_holdTime",
                    "type": "uint64"
                }
            ],
            "name": "setWithdrawHoldTimeInSeconds",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_fullUnlockSeconds",
                    "type": "uint128"
                }
            ],
            "name": "setFullUnlockRewardSeconds",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_newTimeAfterEmergencyCanBeActivated",
                    "type": "uint64"
                }
            ],
            "name": "setTimeAfterEmergencyCanBeActivated",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_nonce",
                    "type": "uint64"
                }
            ],
            "name": "encodeDepositPayload",
            "outputs": [
                {
                    "name": "depositPayload",
                    "type": "cell"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_payload",
                    "type": "cell"
                }
            ],
            "name": "decodeDepositPayload",
            "outputs": [
                {
                    "name": "nonce",
                    "type": "uint64"
                },
                {
                    "name": "correct",
                    "type": "bool"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                }
            ],
            "name": "getDepositStEverAmount",
            "outputs": [
                {
                    "name": "value0",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                }
            ],
            "name": "getWithdrawEverAmount",
            "outputs": [
                {
                    "name": "value0",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_time",
                    "type": "uint128"
                }
            ],
            "name": "getDepositStEverAmountFor",
            "outputs": [
                {
                    "name": "value0",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_amount",
                    "type": "uint128"
                },
                {
                    "name": "_time",
                    "type": "uint128"
                }
            ],
            "name": "getWithdrawEverAmountFor",
            "outputs": [
                {
                    "name": "value0",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "time",
                    "type": "uint128"
                }
            ],
            "name": "getLockStateFor",
            "outputs": [
                {
                    "name": "_remainingLockedAssets",
                    "type": "uint128"
                },
                {
                    "name": "_remainingSeconds",
                    "type": "uint128"
                },
                {
                    "name": "_effectiveEverAssets",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "answerId",
                    "type": "uint32"
                },
                {
                    "name": "_user",
                    "type": "address"
                }
            ],
            "name": "getAccountAddress",
            "outputs": [
                {
                    "name": "value0",
                    "type": "address"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_newAccountCode",
                    "type": "cell"
                }
            ],
            "name": "setNewAccountCode",
            "outputs": []
        },
        {
            "inputs": [],
            "name": "upgradeStEverAccount",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_users",
                    "type": "address[]"
                }
            ],
            "name": "upgradeStEverAccounts",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_users",
                    "type": "address[]"
                },
                {
                    "name": "_startIdx",
                    "type": "uint128"
                }
            ],
            "name": "_upgradeStEverAccounts",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_user",
                    "type": "address"
                },
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_newVersion",
                    "type": "uint32"
                }
            ],
            "name": "onAccountUpgraded",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "answerId",
                    "type": "uint32"
                },
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterNonce",
                    "type": "uint32"
                }
            ],
            "name": "getClusterAddress",
            "outputs": [
                {
                    "name": "value0",
                    "type": "address"
                }
            ]
        },
        {
            "inputs": [
                {
                    "name": "_newClusterCode",
                    "type": "cell"
                }
            ],
            "name": "setNewClusterCode",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_clusterNonce",
                    "type": "uint32"
                }
            ],
            "name": "upgradeStEverCluster",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_clusters",
                    "type": "address[]"
                }
            ],
            "name": "upgradeStEverClusters",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_clusters",
                    "type": "address[]"
                },
                {
                    "name": "_startIdx",
                    "type": "uint128"
                }
            ],
            "name": "_upgradeStEverClusters",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "_clusterOwner",
                    "type": "address"
                },
                {
                    "name": "_clusterNonce",
                    "type": "uint32"
                },
                {
                    "name": "_sendGasTo",
                    "type": "address"
                },
                {
                    "name": "_newVersion",
                    "type": "uint32"
                }
            ],
            "name": "onClusterUpgraded",
            "outputs": []
        },
        {
            "inputs": [
                {
                    "name": "answerId",
                    "type": "uint32"
                }
            ],
            "name": "getDetails",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "nonce",
                            "type": "uint128"
                        },
                        {
                            "name": "governance",
                            "type": "uint256"
                        },
                        {
                            "name": "stEverSupply",
                            "type": "uint128"
                        },
                        {
                            "name": "totalAssets",
                            "type": "uint128"
                        },
                        {
                            "name": "availableAssets",
                            "type": "uint128"
                        },
                        {
                            "name": "totalStEverFee",
                            "type": "uint128"
                        },
                        {
                            "name": "effectiveEverAssets",
                            "type": "uint128"
                        },
                        {
                            "name": "remainingLockedAssets",
                            "type": "uint128"
                        },
                        {
                            "name": "unlockPerSecond",
                            "type": "uint128"
                        },
                        {
                            "name": "stEverWallet",
                            "type": "address"
                        },
                        {
                            "name": "stTokenRoot",
                            "type": "address"
                        },
                        {
                            "name": "lastUnlockTime",
                            "type": "uint64"
                        },
                        {
                            "name": "fullUnlockSeconds",
                            "type": "uint128"
                        },
                        {
                            "name": "remainingSeconds",
                            "type": "uint128"
                        },
                        {
                            "name": "gainFee",
                            "type": "uint128"
                        },
                        {
                            "name": "stEverFeePercent",
                            "type": "uint32"
                        },
                        {
                            "name": "minStrategyDepositValue",
                            "type": "uint128"
                        },
                        {
                            "name": "minStrategyWithdrawValue",
                            "type": "uint128"
                        },
                        {
                            "name": "isPaused",
                            "type": "bool"
                        },
                        {
                            "name": "strategyFactory",
                            "type": "address"
                        },
                        {
                            "name": "withdrawHoldTime",
                            "type": "uint64"
                        },
                        {
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "name": "accountVersion",
                            "type": "uint32"
                        },
                        {
                            "name": "stEverVaultVersion",
                            "type": "uint32"
                        },
                        {
                            "name": "clusterVersion",
                            "type": "uint32"
                        },
                        {
                            "name": "timeAfterEmergencyCanBeActivated",
                            "type": "uint64"
                        },
                        {
                            "components": [
                                {
                                    "name": "isEmergency",
                                    "type": "bool"
                                },
                                {
                                    "name": "isPaused",
                                    "type": "bool"
                                },
                                {
                                    "name": "emitter",
                                    "type": "address"
                                },
                                {
                                    "name": "emitTimestamp",
                                    "type": "uint64"
                                }
                            ],
                            "name": "emergencyState",
                            "type": "tuple"
                        }
                    ],
                    "name": "value0",
                    "type": "tuple"
                }
            ]
        },
        {
            "inputs": [],
            "name": "nonce",
            "outputs": [
                {
                    "name": "nonce",
                    "type": "uint128"
                }
            ]
        },
        {
            "inputs": [],
            "name": "strategies",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "lastReport",
                            "type": "uint128"
                        },
                        {
                            "name": "totalGain",
                            "type": "uint128"
                        },
                        {
                            "name": "depositingAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "withdrawingAmount",
                            "type": "uint128"
                        },
                        {
                            "name": "totalAssets",
                            "type": "uint128"
                        },
                        {
                            "name": "cluster",
                            "type": "address"
                        },
                        {
                            "name": "state",
                            "type": "uint8"
                        }
                    ],
                    "name": "strategies",
                    "type": "map(address,tuple)"
                }
            ]
        },
        {
            "inputs": [],
            "name": "clusterPools",
            "outputs": [
                {
                    "components": [
                        {
                            "name": "currentClusterNonce",
                            "type": "uint32"
                        },
                        {
                            "name": "clusters",
                            "type": "map(uint32,address)"
                        }
                    ],
                    "name": "clusterPools",
                    "type": "map(address,tuple)"
                }
            ]
        }
    ],
    "header": [
        "pubkey",
        "time",
        "expire"
    ],
    "version": "2.2"
} as const
