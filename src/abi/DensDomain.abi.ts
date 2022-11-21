export const DensDomainAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "onDeployRetry",
            "id": "0x4A2E4FD6",
            "inputs": [
                {"name":"value0","type":"cell"},
                {"name":"params","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getDurationConfig",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"durationConfig","type":"tuple"}
            ]
        },
        {
            "name": "getConfig",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"components":[{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"}],"name":"config","type":"tuple"}
            ]
        },
        {
            "name": "getPrice",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"price","type":"uint128"}
            ]
        },
        {
            "name": "getFlags",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"reserved","type":"bool"},
                {"name":"inZeroAuction","type":"bool"},
                {"name":"needZeroAuction","type":"bool"}
            ]
        },
        {
            "name": "getZeroAuction",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"zeroAuction","type":"optional(address)"}
            ]
        },
        {
            "name": "startZeroAuction",
            "inputs": [
                {"components":[{"name":"auctionRoot","type":"address"},{"name":"tokenRoot","type":"address"},{"name":"duration","type":"uint32"}],"name":"config","type":"tuple"},
                {"name":"amount","type":"uint128"},
                {"name":"sender","type":"address"}
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
            "name": "expectedRenewAmount",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"newExpireTime","type":"uint32"}
            ],
            "outputs": [
                {"name":"amount","type":"uint128"}
            ]
        },
        {
            "name": "renew",
            "inputs": [
                {"name":"amount","type":"uint128"},
                {"name":"sender","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "unreserve",
            "inputs": [
                {"name":"owner","type":"address"},
                {"name":"price","type":"uint128"},
                {"name":"expireTime","type":"uint32"},
                {"name":"needZeroAuction","type":"bool"}
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
            "name": "getJson",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"json","type":"string"}
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
            "name": "confiscate",
            "inputs": [
                {"name":"newOwner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "expire",
            "inputs": [
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
                {"name":"owner","type":"address"},
                {"name":"initTime","type":"uint32"},
                {"name":"expireTime","type":"uint32"}
            ]
        },
        {
            "name": "getStatus",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"status","type":"uint8"}
            ]
        },
        {
            "name": "resolve",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"target","type":"address"}
            ]
        },
        {
            "name": "query",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"key","type":"uint32"}
            ],
            "outputs": [
                {"name":"value","type":"optional(cell)"}
            ]
        },
        {
            "name": "getRecords",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"records","type":"map(uint32,cell)"}
            ]
        },
        {
            "name": "setTarget",
            "inputs": [
                {"name":"target","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "setRecords",
            "inputs": [
                {"name":"records","type":"map(uint32,cell)"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "setRecord",
            "inputs": [
                {"name":"key","type":"uint32"},
                {"name":"value","type":"cell"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "createSubdomain",
            "inputs": [
                {"name":"name","type":"string"},
                {"name":"owner","type":"address"},
                {"name":"renewable","type":"bool"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "renewSubdomain",
            "inputs": [
                {"name":"subdomain","type":"address"},
                {"name":"owner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "requestUpgrade",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "acceptUpgrade",
            "inputs": [
                {"name":"sid","type":"uint16"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"},
                {"name":"code","type":"cell"},
                {"name":"params","type":"cell"},
                {"name":"remainingGasTo","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "getSID",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"sid","type":"uint16"}
            ]
        },
        {
            "name": "getVersion",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"version","type":"tuple"}
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
            "name": "constructor",
            "inputs": [
            ],
            "outputs": [
            ]
        },
        {
            "name": "_owner",
            "inputs": [
            ],
            "outputs": [
                {"name":"_owner","type":"address"}
            ]
        },
        {
            "name": "_manager",
            "inputs": [
            ],
            "outputs": [
                {"name":"_manager","type":"address"}
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
            "name": "_sid",
            "inputs": [
            ],
            "outputs": [
                {"name":"_sid","type":"uint16"}
            ]
        },
        {
            "name": "_version",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"_version","type":"tuple"}
            ]
        },
        {
            "name": "_id",
            "inputs": [
            ],
            "outputs": [
                {"name":"_id","type":"uint256"}
            ]
        },
        {
            "name": "_root",
            "inputs": [
            ],
            "outputs": [
                {"name":"_root","type":"address"}
            ]
        },
        {
            "name": "_path",
            "inputs": [
            ],
            "outputs": [
                {"name":"_path","type":"string"}
            ]
        },
        {
            "name": "_initTime",
            "inputs": [
            ],
            "outputs": [
                {"name":"_initTime","type":"uint32"}
            ]
        },
        {
            "name": "_expireTime",
            "inputs": [
            ],
            "outputs": [
                {"name":"_expireTime","type":"uint32"}
            ]
        },
        {
            "name": "_target",
            "inputs": [
            ],
            "outputs": [
                {"name":"_target","type":"address"}
            ]
        },
        {
            "name": "_records",
            "inputs": [
            ],
            "outputs": [
                {"name":"_records","type":"map(uint32,cell)"}
            ]
        },
        {
            "name": "_durationConfig",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"_durationConfig","type":"tuple"}
            ]
        },
        {
            "name": "_config",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"}],"name":"_config","type":"tuple"}
            ]
        },
        {
            "name": "_price",
            "inputs": [
            ],
            "outputs": [
                {"name":"_price","type":"uint128"}
            ]
        },
        {
            "name": "_reserved",
            "inputs": [
            ],
            "outputs": [
                {"name":"_reserved","type":"bool"}
            ]
        },
        {
            "name": "_inZeroAuction",
            "inputs": [
            ],
            "outputs": [
                {"name":"_inZeroAuction","type":"bool"}
            ]
        },
        {
            "name": "_needZeroAuction",
            "inputs": [
            ],
            "outputs": [
                {"name":"_needZeroAuction","type":"bool"}
            ]
        },
        {
            "name": "_auctionRoot",
            "inputs": [
            ],
            "outputs": [
                {"name":"_auctionRoot","type":"address"}
            ]
        },
        {
            "name": "_zeroAuction",
            "inputs": [
            ],
            "outputs": [
                {"name":"_zeroAuction","type":"address"}
            ]
        },
        {
            "name": "_paybackAmount",
            "inputs": [
            ],
            "outputs": [
                {"name":"_paybackAmount","type":"uint128"}
            ]
        },
        {
            "name": "_paybackOwner",
            "inputs": [
            ],
            "outputs": [
                {"name":"_paybackOwner","type":"address"}
            ]
        }
    ],
    "data": [
    ],
    "events": [
        {
            "name": "ZeroAuctionStarted",
            "inputs": [
                {"name":"zeroAuction","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "ZeroAuctionFinished",
            "inputs": [
                {"name":"newOwner","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "Renewed",
            "inputs": [
                {"name":"time","type":"uint32"},
                {"name":"duration","type":"uint32"},
                {"name":"newExpireTime","type":"uint32"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "ChangedTarget",
            "inputs": [
                {"name":"oldTarget","type":"address"},
                {"name":"newTarget","type":"address"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "ChangedOwner",
            "inputs": [
                {"name":"oldOwner","type":"address"},
                {"name":"newOwner","type":"address"},
                {"name":"confiscate","type":"bool"}
            ],
            "outputs": [
            ]
        },
        {
            "name": "CodeUpgraded",
            "inputs": [
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"oldVersion","type":"tuple"},
                {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"newVersion","type":"tuple"}
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
        {"name":"_owner","type":"address"},
        {"name":"_manager","type":"address"},
        {"name":"_indexCode","type":"cell"},
        {"name":"_sid","type":"uint16"},
        {"components":[{"name":"major","type":"uint32"},{"name":"minor","type":"uint32"}],"name":"_version","type":"tuple"},
        {"name":"_id","type":"uint256"},
        {"name":"_root","type":"address"},
        {"name":"_path","type":"string"},
        {"name":"_initTime","type":"uint32"},
        {"name":"_expireTime","type":"uint32"},
        {"name":"_target","type":"address"},
        {"name":"_records","type":"map(uint32,cell)"},
        {"components":[{"name":"startZeroAuction","type":"uint32"},{"name":"expiring","type":"uint32"},{"name":"grace","type":"uint32"}],"name":"_durationConfig","type":"tuple"},
        {"components":[{"name":"maxDuration","type":"uint32"},{"name":"graceFinePercent","type":"uint128"}],"name":"_config","type":"tuple"},
        {"name":"_price","type":"uint128"},
        {"name":"_reserved","type":"bool"},
        {"name":"_inZeroAuction","type":"bool"},
        {"name":"_needZeroAuction","type":"bool"},
        {"name":"_auctionRoot","type":"address"},
        {"name":"_zeroAuction","type":"address"},
        {"name":"_paybackAmount","type":"uint128"},
        {"name":"_paybackOwner","type":"address"}
    ]
} as const
