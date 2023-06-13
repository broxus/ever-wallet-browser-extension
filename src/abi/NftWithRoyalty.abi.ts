export const NftWithRoyaltyAbi = {
	"ABI version": 2,
	"version": "2.2",
	"header": ["pubkey", "time", "expire"],
	"functions": [
		{
			"name": "multiTokenSupply",
			"inputs": [
				{"name":"answerId","type":"uint32"}
			],
			"outputs": [
				{"name":"count","type":"uint128"}
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
	],
	"data": [],
	"events": [],
	"fields": []
} as const
