export const MultiTokenWalletAbi = {
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
	"fields": []
} as const
