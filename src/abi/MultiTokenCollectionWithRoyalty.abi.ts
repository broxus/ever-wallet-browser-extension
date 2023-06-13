export const MultiTokenCollectionWithRoyaltyAbi = {
	"ABI version": 2,
	"version": "2.2",
	"header": ["pubkey", "time", "expire"],
	"functions": [
		{
			"name": "multiTokenWalletAddress",
			"inputs": [
				{"name":"answerId","type":"uint32"},
				{"name":"id","type":"uint256"},
				{"name":"owner","type":"address"}
			],
			"outputs": [
				{"name":"token","type":"address"}
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
			"name": "nftAddress",
			"inputs": [
				{"name":"answerId","type":"uint32"},
				{"name":"id","type":"uint256"}
			],
			"outputs": [
				{"name":"nft","type":"address"}
			]
		},
	],
	"data": [],
	"events": [],
	"fields": [
		{"name":"_pubkey","type":"uint256"},
		{"name":"_timestamp","type":"uint64"},
		{"name":"_constructorFlag","type":"bool"},
		{"name":"_owner","type":"address"},
		{"name":"_supportedInterfaces","type":"optional(cell)"},
		{"name":"_codeNft","type":"cell"},
		{"name":"_totalSupply","type":"uint128"},
		{"name":"_json","type":"string"},
		{"name":"_codeIndex","type":"cell"},
		{"name":"_codeIndexBasis","type":"cell"},
		{"name":"_indexDeployValue","type":"uint128"},
		{"name":"_indexDestroyValue","type":"uint128"},
		{"name":"_deployIndexBasisValue","type":"uint128"},
		{"name":"_tokenCode","type":"cell"},
		{"name":"_deployer","type":"address"},
		{"name":"_nonce","type":"uint64"},
		{"name":"_platformCode","type":"cell"},
		{"name":"_lastTokenId","type":"uint128"}
	]
} as const
