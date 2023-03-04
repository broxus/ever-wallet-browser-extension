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
    ],
    "data": [],
    "events": [],
    "fields": []
} as const
