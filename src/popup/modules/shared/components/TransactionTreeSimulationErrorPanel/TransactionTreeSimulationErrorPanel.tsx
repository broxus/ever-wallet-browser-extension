import type * as nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'

import { convertAddress } from '@app/shared'

import { CopyButton } from '../CopyButton'
import { Checkbox } from '../Checkbox'
import styles from './TransactionTreeSimulationErrorPanel.module.scss'

interface Props {
    errors: nt.TransactionTreeSimulationError[];
    confirmed: boolean;
    onConfirmChange: (value: boolean) => void;
}

export const TransactionTreeSimulationErrorPanel = memo(({ errors, confirmed, onConfirmChange }: Props) => (
    <div className={styles.panel}>
        <div className={styles.message}>
            Transaction tree execution may fail.
        </div>
        <ul className={styles.list}>
            {...errors.map(({ address, error }) => {
                const copyAddress = (
                    <CopyButton text={address}>
                        <button type="button" className={styles.button}>
                            {convertAddress(address)}
                        </button>
                    </CopyButton>
                )
                if (error.type === 'compute_phase') {
                    return (
                        <li>Execution failed on {copyAddress} with exit code {error.code}.</li>
                    )
                }
                if (error.type === 'action_phase') {
                    return (
                        <li>Action phase failed on {copyAddress} with exit code {error.code}.</li>
                    )
                }
                if (error.type === 'frozen') {
                    return (
                        <li>Account {copyAddress} will be frozen due to storage fee debt.</li>
                    )
                }
                if (error.type === 'deleted') {
                    return (
                        <li>Account {copyAddress} will be deleted due to storage fee debt.</li>
                    )
                }
                return null
            })}
        </ul>

        <Checkbox
            className={styles.checkbox}
            checked={confirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
        >
            Send transaction anyway
        </Checkbox>
    </div>
))
