export const MultiTokenWalletWithRoyaltyAbi = {
	"ABI version": 2,
	"version": "2.2",
	"header": ["pubkey", "time", "expire"],
	"functions": [
		{
			"name": "getInfo",
			"inputs": [
				{"name":"answerId","type":"uint32"}
			],
			"outputs": [
				{"name":"id","type":"uint256"},
				{"name":"owner","type":"address"},
				{"name":"collection","type":"address"}
			]
		},
		{
			"name": "balance",
			"inputs": [
				{"name":"answerId","type":"uint32"}
			],
			"outputs": [
				{"name":"value","type":"uint128"}
			]
		},
		{
			"name": "transfer",
			"inputs": [
				{"name":"count","type":"uint128"},
				{"name":"recipient","type":"address"},
				{"name":"deployTokenWalletValue","type":"uint128"},
				{"name":"remainingGasTo","type":"address"},
				{"name":"notify","type":"bool"},
				{"name":"payload","type":"cell"}
			],
			"outputs": [
			]
		},
	],
	"data": [],
	"events": [],
	"fields": [
		{"name":"_pubkey","type":"uint256"},
		{"name":"_timestamp","type":"uint64"},
		{"name":"_constructorFlag","type":"bool"},
		{"name":"_supportedInterfaces","type":"optional(cell)"},
		{"name":"_id","type":"uint256"},
		{"name":"_collection","type":"address"},
		{"name":"_owner","type":"address"},
		{"name":"_nft","type":"address"},
		{"name":"_balance","type":"uint128"},
		{"name":"_indexDeployValue","type":"uint128"},
		{"name":"_indexDestroyValue","type":"uint128"},
		{"name":"_codeIndex","type":"cell"},
		{"name":"_platformCode","type":"cell"},
		{"name":"_royaltyAddress","type":"address"},
		{"name":"_royalty","type":"uint128"}
	]
} as const
