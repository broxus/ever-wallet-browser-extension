export const NftTIP422Abi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [
                {"name":"owner","type":"address"},
                {"name":"sendGasTo","type":"address"},
                {"name":"remainOnNft","type":"uint128"},
                {"name":"indexDeployValue","type":"uint128"},
                {"name":"indexDestroyValue","type":"uint128"},
                {"name":"codeIndex","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "burn",
            "inputs": [
                {"name":"sendGasTo","type":"address"},
                {"name":"callbackTo","type":"address"},
                {"name":"callbackPayload","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "indexCode",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"code","type":"cell"}
            ]
        },
        {
            "name": "indexCodeHash",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"hash","type":"uint256"}
            ]
        },
        {
            "name": "resolveIndex",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"collection","type":"address"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
                {"name":"index","type":"address"}
            ]
        },
        {
            "name": "getUrlParts",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"part","type":"cell"}
            ]
        },
        {
            "name": "transfer",
            "inputs": [
                {"name":"to","type":"address"},
                {"name":"sendGasTo","type":"address"},
                {"components":[{"name":"value","type":"uint128"},{"name":"payload","type":"cell"}],"name":"callbacks","type":"map(address,tuple)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "changeOwner",
            "inputs": [
                {"name":"newOwner","type":"address"},
                {"name":"sendGasTo","type":"address"},
                {"components":[{"name":"value","type":"uint128"},{"name":"payload","type":"cell"}],"name":"callbacks","type":"map(address,tuple)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "changeManager",
            "inputs": [
                {"name":"newManager","type":"address"},
                {"name":"sendGasTo","type":"address"},
                {"components":[{"name":"value","type":"uint128"},{"name":"payload","type":"cell"}],"name":"callbacks","type":"map(address,tuple)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getInfo",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"id","type":"uint256"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"},
                {"name":"collection","type":"address"}
            ]
        },
        {
            "name": "supportsInterface",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"interfaceID","type":"uint32"}
            ],
            "outputs": [
                {"name":"value0","type":"bool"}
            ]
        }
    ],
    "data": [
        {"key":1,"name":"_id","type":"uint256"}
    ],
    "events": [
        {
            "name": "metadataUpdated",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "NftCreated",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"},
                {"name":"collection","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "OwnerChanged",
            "inputs": [
                {"name":"oldOwner","type":"address"},
                {"name":"newOwner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "ManagerChanged",
            "inputs": [
                {"name":"oldManager","type":"address"},
                {"name":"newManager","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "NftBurned",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"},
                {"name":"collection","type":"address"}
            ],
            "outputs": [
            ]
        }
    ],
    "fields": [
        {"name":"_pubkey","type":"uint256"},
        {"name":"_timestamp","type":"uint64"},
        {"name":"_constructorFlag","type":"bool"},
        {"name":"_supportedInterfaces","type":"optional(cell)"},
        {"name":"_id","type":"uint256"},
        {"name":"_collection","type":"address"},
        {"name":"_owner","type":"address"},
        {"name":"_manager","type":"address"},
        {"name":"_indexDeployValue","type":"uint128"},
        {"name":"_indexDestroyValue","type":"uint128"},
        {"name":"_codeIndex","type":"cell"}
    ]
} as const
