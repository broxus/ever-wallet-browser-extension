export const IndexAbi = {
	"ABI version": 2,
	"version": "2.2",
	"header": ["time"],
	"functions": [
		{
			"name": "constructor",
			"inputs": [
				{"name":"collection","type":"address"}
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
				{"name":"collection","type":"address"},
				{"name":"owner","type":"address"},
				{"name":"nft","type":"address"}
			]
		},
		{
			"name": "destruct",
			"inputs": [
				{"name":"gasReceiver","type":"address"}
			],
			"outputs": [
			]
		}
	],
	"data": [
		{"key":1,"name":"_nft","type":"address"}
	],
	"events": [
	],
	"fields": [
		{"name":"_pubkey","type":"uint256"},
		{"name":"_timestamp","type":"uint64"},
		{"name":"_constructorFlag","type":"bool"},
		{"name":"_nft","type":"address"},
		{"name":"_collection","type":"address"},
		{"name":"_owner","type":"address"}
	]
} as const
