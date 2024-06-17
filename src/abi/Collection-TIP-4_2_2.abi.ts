export const CollectionTIP422Abi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [
                {"name":"codeNft","type":"cell"},
                {"name":"codeIndex","type":"cell"},
                {"name":"codeIndexBasis","type":"cell"},
                {"name":"owner","type":"address"},
                {"name":"remainOnNft","type":"uint128"},
                {"name":"baseNftUrl","type":"string"},
                {"name":"collectionUrl","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "codeDepth",
            "inputs": [
            ],
            "outputs": [
                {"name":"value0","type":"uint16"}
            ]
        },
        {
            "name": "setBaseUrl",
            "inputs": [
                {"name":"_baseNftUrl","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "mintNft",
            "inputs": [
                {"name":"_owner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "totalMinted",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"count","type":"uint256"}
            ]
        },
        {
            "name": "batchMintNft",
            "inputs": [
                {"name":"_owner","type":"address"},
                {"name":"count","type":"uint16"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "setRemainOnNft",
            "inputs": [
                {"name":"remainOnNft","type":"uint128"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "resolveIndexCodeHash",
            "inputs": [
                {"name":"collection","type":"address"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
                {"name":"hash","type":"uint256"}
            ]
        },
        {
            "name": "acceptNftBurn",
            "inputs": [
                {"name":"_id","type":"uint256"},
                {"name":"_owner","type":"address"},
                {"name":"_manager","type":"address"},
                {"name":"_sendGasTo","type":"address"},
                {"name":"_callbackTo","type":"address"},
                {"name":"_callbackPayload","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "owner",
            "inputs": [
            ],
            "outputs": [
                {"name":"value0","type":"address"}
            ]
        },
        {
            "name": "transferOwnership",
            "inputs": [
                {"name":"newOwner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "indexBasisCode",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"code","type":"cell"}
            ]
        },
        {
            "name": "indexBasisCodeHash",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"hash","type":"uint256"}
            ]
        },
        {
            "name": "resolveIndexBasis",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"indexBasis","type":"address"}
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
            "name": "getCollectionUrl",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"collectionUrl","type":"string"}
            ]
        },
        {
            "name": "getNftUrl",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"parts","type":"cell"}
            ],
            "outputs": [
                {"name":"nftUrl","type":"string"}
            ]
        },
        {
            "name": "totalSupply",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"count","type":"uint128"}
            ]
        },
        {
            "name": "nftCode",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"code","type":"cell"}
            ]
        },
        {
            "name": "nftCodeHash",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"codeHash","type":"uint256"}
            ]
        },
        {
            "name": "nftAddress",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"id","type":"uint256"}
            ],
            "outputs": [
                {"name":"nft","type":"address"}
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
        {"key":1,"name":"nonce_","type":"uint64"}
    ],
    "events": [
        {
            "name": "OwnershipTransferred",
            "inputs": [
                {"name":"oldOwner","type":"address"},
                {"name":"newOwner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "collectionMetadataUpdated",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "nftMetadataUpdated",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "NftCreated",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"nft","type":"address"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"},
                {"name":"creator","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "NftBurned",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"nft","type":"address"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"}
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
        {"name":"_codeNft","type":"cell"},
        {"name":"_totalSupply","type":"uint128"},
        {"name":"baseNftUrl","type":"string"},
        {"name":"collectionUrl_","type":"string"},
        {"name":"_codeIndex","type":"cell"},
        {"name":"_codeIndexBasis","type":"cell"},
        {"name":"_indexDeployValue","type":"uint128"},
        {"name":"_indexDestroyValue","type":"uint128"},
        {"name":"_deployIndexBasisValue","type":"uint128"},
        {"name":"owner_","type":"address"},
        {"name":"nonce_","type":"uint64"},
        {"name":"_remainOnNft","type":"uint128"},
        {"name":"_totalMinted","type":"uint256"}
    ]
} as const
