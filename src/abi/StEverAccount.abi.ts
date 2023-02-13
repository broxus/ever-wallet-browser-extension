export const StEverAccountAbi = {
    "ABI version": 2,
    "version": "2.2",
    "header": ["time", "expire"],
    "functions": [
        {
            "name": "withdrawRequests",
            "inputs": [
            ],
            "outputs": [
                {"components":[{"name":"amount","type":"uint128"},{"name":"timestamp","type":"uint64"}],"name":"withdrawRequests","type":"map(uint64,tuple)"}
            ]
        }
    ],
    "data": [],
    "events": [],
    "fields": []
} as const
