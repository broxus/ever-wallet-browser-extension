export const INftTransferAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "onNftTransfer",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"oldOwner","type":"address"},
                {"name":"newOwner","type":"address"},
                {"name":"oldManager","type":"address"},
                {"name":"newManager","type":"address"},
                {"name":"collection","type":"address"},
                {"name":"gasReceiver","type":"address"},
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
