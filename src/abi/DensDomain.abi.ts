export const DensDomainAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["pubkey", "time", "expire"],
    "functions": [
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
            "name": "getPath",
            "inputs": [
                {"name":"answerId","type":"uint32"}
            ],
            "outputs": [
                {"name":"path","type":"string"}
            ]
        },
    ],
    "data": [],
    "events": [],
    "fields": []
} as const
