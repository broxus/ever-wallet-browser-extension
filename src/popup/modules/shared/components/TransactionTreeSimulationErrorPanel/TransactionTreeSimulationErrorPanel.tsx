import type * as nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'

import { CopyButton } from '../CopyButton'
import { Checkbox } from '../Checkbox'
import styles from './TransactionTreeSimulationErrorPanel.module.scss'

interface Props {
    errors: nt.TransactionTreeSimulationError[];
    confirmed: boolean;
    onConfirmChange: (value: boolean) => void;
}

export const TransactionTreeSimulationErrorPanel = memo(({ errors, confirmed, onConfirmChange }: Props) => {
    const intl = useIntl()

    return (
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
                            <li>
                                <FormattedMessage
                                    id="TX_ERROR_COMPUTE_PHASE"
                                    values={{
                                        address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                        code: error.code,
                                    }}
                                />
                            </li>
                        )
                    }
                    if (error.type === 'action_phase') {
                        return (
                            <li>
                                <FormattedMessage
                                    id="TX_ERROR_ACTION_PHASE"
                                    values={{
                                        address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                        code: error.code,
                                    }}
                                />
                            </li>
                        )
                    }
                    if (error.type === 'frozen') {
                        return (
                            <li>
                                <FormattedMessage
                                    id="TX_ERROR_FROZEN"
                                    values={{
                                        address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                    }}
                                />
                            </li>
                        )
                    }
                    if (error.type === 'deleted') {
                        return (
                            <li>
                                <FormattedMessage
                                    id="TX_ERROR_DELETED"
                                    values={{
                                        address: () => copyAddress, // eslint-disable-line react/no-unstable-nested-components
                                    }}
                                />
                            </li>
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
                {intl.formatMessage({ id: 'TX_SEND_TRANSACTION_ANYWAY' })}
            </Checkbox>
        </div>
    )
})
