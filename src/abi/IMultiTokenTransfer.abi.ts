export const IMultiTokenTransferAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "onMultiTokenTransfer",
            "inputs": [
                {"name":"collection","type":"address"},
                {"name":"tokenId","type":"uint256"},
                {"name":"count","type":"uint128"},
                {"name":"sender","type":"address"},
                {"name":"senderToken","type":"address"},
                {"name":"remainingGasTo","type":"address"},
                {"name":"payload","type":"cell"}
            ],
            "outputs": [
            ]
        }
    ],
    "data": [],
    "events": [],
    "fields": []
} as const
