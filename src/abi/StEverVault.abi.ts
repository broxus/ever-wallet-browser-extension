export const StEverVaultAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "deposit",
            "inputs": [
                {"name":"_amount","type":"uint128"},
                {"name":"_nonce","type":"uint64"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getDetails",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"components":[{"name":"stTokenRoot","type":"address"},{"name":"stEverWallet","type":"address"},{"name":"stEverSupply","type":"uint128"},{"name":"totalAssets","type":"uint128"},{"name":"availableAssets","type":"uint128"},{"name":"owner","type":"address"},{"name":"governance","type":"uint256"},{"name":"gainFee","type":"uint128"},{"name":"accountVersion","type":"uint32"},{"name":"stEverVaultVersion","type":"uint32"},{"name":"minStrategyDepositValue","type":"uint128"},{"name":"minStrategyWithdrawValue","type":"uint128"},{"name":"isPaused","type":"bool"},{"name":"stEverFeePercent","type":"uint32"},{"name":"totalStEverFee","type":"uint128"},{"components":[{"name":"isEmergency","type":"bool"},{"name":"isPaused","type":"bool"},{"name":"emitter","type":"address"},{"name":"emitTimestamp","type":"uint64"}],"name":"emergencyState","type":"tuple"}],"name":"value0","type":"tuple"}
            ]
        },
        {
            "name": "removePendingWithdraw",
            "inputs": [
                {"name":"_nonce","type":"uint64"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "encodeDepositPayload",
            "inputs": [
                {"name":"_nonce","type":"uint64"}
            ],
            "outputs": [
                {"name":"depositPayload","type":"cell"}
            ]
        },
        {
            "name": "getAccountAddress",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"_user","type":"address"}
            ],
            "outputs": [
                {"name":"value0","type":"address"}
            ]
        },
        {
            "name": "getDepositStEverAmount",
            "inputs": [
                {"name":"_amount","type":"uint128"}
            ],
            "outputs": [
                {"name":"value0","type":"uint128"}
            ]
        },
        {
            "name": "getWithdrawEverAmount",
            "inputs": [
                {"name":"_amount","type":"uint128"}
            ],
            "outputs": [
                {"name":"value0","type":"uint128"}
            ]
        },
    ],
    "data": [],
    "events": [
        {
            "name": "WithdrawRequest",
            "inputs": [
                {"name":"user","type":"address"},
                {"name":"amount","type":"uint128"},
                {"name":"nonce","type":"uint64"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "WithdrawSuccess",
            "inputs": [
                {"name":"user","type":"address"},
                {"name":"amount","type":"uint128"},
                {"components":[{"name":"stEverAmount","type":"uint128"},{"name":"everAmount","type":"uint128"}],"name":"withdrawInfo","type":"map(uint64,tuple)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "WithdrawRequestRemoved",
            "inputs": [
                {"name":"user","type":"address"},
                {"name":"nonce","type":"uint64"}
            ],
            "outputs": [
            ]
        },
    ],
    "fields": []
} as const
