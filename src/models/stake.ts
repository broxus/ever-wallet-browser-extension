import type { DecodedTransaction } from 'everscale-inpage-provider'

import type { StEverAccountAbi, StEverVaultAbi } from '@app/abi'

export type StEverVaultDetails = DecodedTransaction<typeof StEverVaultAbi, 'getDetails'>['output']['value0']
export type DepositParams = DecodedTransaction<typeof StEverVaultAbi, 'deposit'>['input']
export type RemovePendingWithdrawParams = DecodedTransaction<typeof StEverVaultAbi, 'removePendingWithdraw'>['input']
export type WithdrawRequest = DecodedTransaction<typeof StEverAccountAbi, 'withdrawRequests'>['output']['withdrawRequests'][number]

export type ValidatorConfig = {
    validators_elected_for: string;
    elections_start_before: string;
    elections_end_before: string;
    stake_held_for: string;
}

export type CurValidatorConfig = {
    tag: string;
    utime_since: string;
    utime_until: string;
}
