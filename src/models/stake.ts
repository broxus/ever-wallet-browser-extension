import type { DecodedTransaction } from 'everscale-inpage-provider'

import type { StEverVaultAbi, StEverAccountAbi } from '@app/abi'

export type StEverVaultDetails = DecodedTransaction<typeof StEverVaultAbi, 'getDetails'>['output']['value0']
export type DepositParams = DecodedTransaction<typeof StEverVaultAbi, 'deposit'>['input']
export type RemovePendingWithdrawParams = DecodedTransaction<typeof StEverVaultAbi, 'removePendingWithdraw'>['input']
export type WithdrawRequest = DecodedTransaction<typeof StEverAccountAbi, 'withdrawRequests'>['output']['withdrawRequests'][number]
