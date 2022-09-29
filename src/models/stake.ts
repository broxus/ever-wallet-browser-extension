import type { DecodedTransaction } from 'everscale-inpage-provider'

import type { StEverVaultABI, StEverAccountABI } from '@app/abi'

export type StEverVaultDetails = DecodedTransaction<typeof StEverVaultABI, 'getDetails'>['output']['value0']
export type DepositParams = DecodedTransaction<typeof StEverVaultABI, 'deposit'>['input']
export type RemovePendingWithdrawParams = DecodedTransaction<typeof StEverVaultABI, 'removePendingWithdraw'>['input']
export type WithdrawRequest = DecodedTransaction<typeof StEverAccountABI, 'withdrawRequests'>['output']['withdrawRequests'][number]
