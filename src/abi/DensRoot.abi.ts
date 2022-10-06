export const DensRootAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "constructor",
            "inputs": [
                {"name":"domainCode","type":"cell"},
                {"name":"subdomainCode","type":"cell"},
                {"name":"indexBasisCode","type":"cell"},
                {"name":"indexCode","type":"cell"},
                {"name":"json","type":"string"},
                {"name":"platformCode","type":"cell"},
                {"name":"dao","type":"address"},
                {"name":"admin","type":"address"},
                {"components":[{"name":"maxNameLength","type":"uint32"},{"name":"maxPathLength","type":"uint32"},{"name":"minDuration","type":"uint32"},{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"},{"name":"startZeroAuctionFee","type":"uint128"}],"name":"config","type":"tuple"},
                {"components":[{"name":"longPrice","type":"uint128"},{"name":"shortPrices","type":"uint128[]"},{"name":"onlyLettersFeePercent","type":"uint128"},{"name":"noZeroAuctionLength","type":"uint32"}],"name":"priceConfig","type":"tuple"},
                {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"auctionConfig","type":"tuple"},
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"durationConfig","type":"tuple"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getPath",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"path","type":"string"}
            ]
        },
        {
            "name": "getDetails",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"tld","type":"string"},
                {"name":"dao","type":"address"},
                {"name":"active","type":"bool"}
            ]
        },
        {
            "name": "getConfigs",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"components":[{"name":"maxNameLength","type":"uint32"},{"name":"maxPathLength","type":"uint32"},{"name":"minDuration","type":"uint32"},{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"},{"name":"startZeroAuctionFee","type":"uint128"}],"name":"config","type":"tuple"},
                {"components":[{"name":"longPrice","type":"uint128"},{"name":"shortPrices","type":"uint128[]"},{"name":"onlyLettersFeePercent","type":"uint128"},{"name":"noZeroAuctionLength","type":"uint32"}],"name":"priceConfig","type":"tuple"},
                {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"auctionConfig","type":"tuple"},
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"durationConfig","type":"tuple"}
            ]
        },
        {
            "name": "checkName",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"}
            ],
            "outputs": [
                {"name":"correct","type":"bool"}
            ]
        },
        {
            "name": "expectedPrice",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"}
            ],
            "outputs": [
                {"name":"price","type":"uint128"},
                {"name":"needZeroAuction","type":"bool"}
            ]
        },
        {
            "name": "expectedRegisterAmount",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"},
                {"name":"duration","type":"uint32"}
            ],
            "outputs": [
                {"name":"amount","type":"uint128"}
            ]
        },
        {
            "name": "resolve",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"path","type":"string"}
            ],
            "outputs": [
                {"name":"certificate","type":"address"}
            ]
        },
        {
            "name": "expectedCertificateCodeHash",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"target","type":"address"},
                {"name":"sid","type":"uint16"}
            ],
            "outputs": [
                {"name":"codeHash","type":"uint256"}
            ]
        },
        {
            "name": "buildRegisterPayload",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"}
            ],
            "outputs": [
                {"name":"payload","type":"cell"}
            ]
        },
        {
            "name": "buildRenewPayload",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"}
            ],
            "outputs": [
                {"name":"payload","type":"cell"}
            ]
        },
        {
            "name": "buildStartZeroAuctionPayload",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"name","type":"string"}
            ],
            "outputs": [
                {"name":"payload","type":"cell"}
            ]
        },
        {
            "name": "onAcceptTokensTransfer",
            "inputs": [
                {"name":"value0","type":"address"},
                {"name":"amount","type":"uint128"},
                {"name":"sender","type":"address"},
                {"name":"value3","type":"address"},
                {"name":"value4","type":"address"},
                {"name":"payload","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "returnTokensFromDomain",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"amount","type":"uint128"},
                {"name":"recipient","type":"address"},
                {"name":"reason","type":"uint8"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "deploySubdomain",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"name","type":"string"},
                {"components":[{"name":"owner","type":"address"},{"name":"creator","type":"address"},{"name":"expireTime","type":"uint32"},{"name":"parent","type":"address"},{"name":"renewable","type":"bool"}],"name":"setup","type":"tuple"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "confiscate",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"reason","type":"string"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "reserve",
            "inputs": [
                {"name":"paths","type":"string[]"},
                {"name":"reason","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "unreserve",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"reason","type":"string"},
                {"name":"owner","type":"address"},
                {"name":"price","type":"uint128"},
                {"name":"expireTime","type":"uint32"},
                {"name":"needZeroAuction","type":"bool"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "activate",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "deactivate",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "changePriceConfig",
            "inputs": [
                {"components":[{"name":"longPrice","type":"uint128"},{"name":"shortPrices","type":"uint128[]"},{"name":"onlyLettersFeePercent","type":"uint128"},{"name":"noZeroAuctionLength","type":"uint32"}],"name":"priceConfig","type":"tuple"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "changeConfigs",
            "inputs": [
                {"components":[{"name":"maxNameLength","type":"uint32"},{"name":"maxPathLength","type":"uint32"},{"name":"minDuration","type":"uint32"},{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"},{"name":"startZeroAuctionFee","type":"uint128"}],"name":"config","type":"optional(tuple)"},
                {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"auctionConfig","type":"optional(tuple)"},
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"durationConfig","type":"optional(tuple)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "changeAdmin",
            "inputs": [
                {"name":"admin","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "changeDao",
            "inputs": [
                {"name":"dao","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "upgradeToLatest",
            "inputs": [
                {"name":"sid","type":"uint16"},
                {"name":"destination","type":"address"},
                {"name":"remainingGasTo","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "upgradeToSpecific",
            "inputs": [
                {"name":"sid","type":"uint16"},
                {"name":"destination","type":"address"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"},
                {"name":"code","type":"cell"},
                {"name":"params","type":"cell"},
                {"name":"remainingGasTo","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "setVersionActivation",
            "inputs": [
                {"name":"sid","type":"uint16"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"},
                {"name":"active","type":"bool"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "createNewDomainVersion",
            "inputs": [
                {"name":"minor","type":"bool"},
                {"name":"code","type":"cell"},
                {"name":"params","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "createNewSubdomainVersion",
            "inputs": [
                {"name":"minor","type":"bool"},
                {"name":"code","type":"cell"},
                {"name":"params","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "upgrade",
            "inputs": [
                {"name":"code","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getSIDs",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"sids","type":"uint16[]"}
            ]
        },
        {
            "name": "getSlaveData",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"sid","type":"uint16"}
            ],
            "outputs": [
                {"name":"code","type":"cell"},
                {"name":"params","type":"cell"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"latest","type":"tuple"},
                {"name":"versionsCount","type":"uint32"}
            ]
        },
        {
            "name": "getSlaveVersions",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"sid","type":"uint16"}
            ],
            "outputs": [
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"versions","type":"tuple[]"}
            ]
        },
        {
            "name": "getSlaveVersion",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"sid","type":"uint16"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"}
            ],
            "outputs": [
                {"components":[{"name":"hash","type":"uint256"},{"name":"active","type":"bool"}],"name":"data","type":"tuple"}
            ]
        },
        {
            "name": "onWalletDeployed",
            "inputs": [
                {"name":"wallet","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getToken",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"token","type":"address"}
            ]
        },
        {
            "name": "getWallet",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"wallet","type":"address"}
            ]
        },
        {
            "name": "getBalance",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"balance","type":"uint128"}
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
                {"name":"support","type":"bool"}
            ]
        },
        {
            "name": "onMint",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"},
                {"name":"creator","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "onBurn",
            "inputs": [
                {"name":"id","type":"uint256"},
                {"name":"owner","type":"address"},
                {"name":"manager","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "calcAddress",
            "inputs": [
                {"name":"stateInit","type":"cell"}
            ],
            "outputs": [
                {"name":"value0","type":"address"}
            ]
        },
        {
            "name": "getJson",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"json","type":"string"}
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
            "name": "resolveIndexBasis",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"indexBasis","type":"address"}
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
            "name": "_totalSupply",
            "inputs": [
            ],
            "outputs": [
                {"name":"_totalSupply","type":"uint128"}
            ]
        },
        {
            "name": "_nftCode",
            "inputs": [
            ],
            "outputs": [
                {"name":"_nftCode","type":"cell"}
            ]
        },
        {
            "name": "_indexBasisCode",
            "inputs": [
            ],
            "outputs": [
                {"name":"_indexBasisCode","type":"cell"}
            ]
        },
        {
            "name": "_indexCode",
            "inputs": [
            ],
            "outputs": [
                {"name":"_indexCode","type":"cell"}
            ]
        },
        {
            "name": "_json",
            "inputs": [
            ],
            "outputs": [
                {"name":"_json","type":"string"}
            ]
        },
        {
            "name": "_token",
            "inputs": [
            ],
            "outputs": [
                {"name":"_token","type":"address"}
            ]
        },
        {
            "name": "_wallet",
            "inputs": [
            ],
            "outputs": [
                {"name":"_wallet","type":"address"}
            ]
        },
        {
            "name": "_balance",
            "inputs": [
            ],
            "outputs": [
                {"name":"_balance","type":"uint128"}
            ]
        },
        {
            "name": "_randomNonce",
            "inputs": [
            ],
            "outputs": [
                {"name":"_randomNonce","type":"uint256"}
            ]
        },
        {
            "name": "_tld",
            "inputs": [
            ],
            "outputs": [
                {"name":"_tld","type":"string"}
            ]
        },
        {
            "name": "_dao",
            "inputs": [
            ],
            "outputs": [
                {"name":"_dao","type":"address"}
            ]
        },
        {
            "name": "_admin",
            "inputs": [
            ],
            "outputs": [
                {"name":"_admin","type":"address"}
            ]
        },
        {
            "name": "_active",
            "inputs": [
            ],
            "outputs": [
                {"name":"_active","type":"bool"}
            ]
        },
        {
            "name": "_config",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"maxNameLength","type":"uint32"},{"name":"maxPathLength","type":"uint32"},{"name":"minDuration","type":"uint32"},{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"},{"name":"startZeroAuctionFee","type":"uint128"}],"name":"_config","type":"tuple"}
            ]
        },
        {
            "name": "_priceConfig",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"longPrice","type":"uint128"},{"name":"shortPrices","type":"uint128[]"},{"name":"onlyLettersFeePercent","type":"uint128"},{"name":"noZeroAuctionLength","type":"uint32"}],"name":"_priceConfig","type":"tuple"}
            ]
        },
        {
            "name": "_auctionConfig",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"_auctionConfig","type":"tuple"}
            ]
        },
        {
            "name": "_durationConfig",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"_durationConfig","type":"tuple"}
            ]
        }
    ],
    "data": [
        {"key":1,"name":"_randomNonce","type":"uint256"},
        {"key":2,"name":"_tld","type":"string"}
    ],
    "events": [
        {
            "name": "Renewed",
            "inputs": [
                {"name":"path","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "ZeroAuctionStarted",
            "inputs": [
                {"name":"path","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "Confiscated",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"reason","type":"string"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "Reserved",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"reason","type":"string"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "Unreserved",
            "inputs": [
                {"name":"path","type":"string"},
                {"name":"reason","type":"string"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "DomainCodeUpgraded",
            "inputs": [
                {"name":"newVersion","type":"uint16"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "CodeUpgraded",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "NewVersion",
            "inputs": [
                {"name":"sid","type":"uint16"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"},
                {"name":"hash","type":"uint256"},
                {"name":"initial","type":"bool"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "SetActivation",
            "inputs": [
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"},
                {"name":"active","type":"bool"}
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
        {"name":"_totalSupply","type":"uint128"},
        {"name":"_nftCode","type":"cell"},
        {"name":"_indexBasisCode","type":"cell"},
        {"name":"_indexCode","type":"cell"},
        {"name":"_json","type":"string"},
        {"name":"_token","type":"address"},
        {"name":"_wallet","type":"address"},
        {"name":"_balance","type":"uint128"},
        {"name":"_slaves","type":"optional(cell)"},
        {"name":"_randomNonce","type":"uint256"},
        {"name":"_tld","type":"string"},
        {"name":"_dao","type":"address"},
        {"name":"_admin","type":"address"},
        {"name":"_active","type":"bool"},
        {"components":[{"name":"maxNameLength","type":"uint32"},{"name":"maxPathLength","type":"uint32"},{"name":"minDuration","type":"uint32"},{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"},{"name":"startZeroAuctionFee","type":"uint128"}],"name":"_config","type":"tuple"},
        {"components":[{"name":"longPrice","type":"uint128"},{"name":"shortPrices","type":"uint128[]"},{"name":"onlyLettersFeePercent","type":"uint128"},{"name":"noZeroAuctionLength","type":"uint32"}],"name":"_priceConfig","type":"tuple"},
        {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"_auctionConfig","type":"tuple"},
        {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"_durationConfig","type":"tuple"}
    ]
} as const
