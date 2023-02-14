export const DensRootAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
        {
            "name": "resolve",
            "inputs": [
                {"name":"answerId","type":"uint32"},
                {"name":"path","type":"string"}
            ],
            "outputs": [
                {"name":"certificate","type":"address"}
            ]
        }
    ],
    "data": [],
    "events": [],
    "fields": []
} as const
