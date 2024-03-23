export const MultiTokenCollectionAbi = {
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
	"fields": []
} as const
