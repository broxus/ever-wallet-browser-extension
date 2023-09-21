export const TokenRootAbi = {
  'ABI version': 2,
  version: '2.2',
  header: ['pubkey', 'time', 'expire'],
  functions: [
    {
      name: 'walletOf',
      inputs: [
        { name: 'answerId', type: 'uint32' },
        { name: 'walletOwner', type: 'address' },
      ],
      outputs: [{ name: 'value0', type: 'address' }],
    },
  ],
  data: [],
  events: [],
  fields: [],
} as const;
