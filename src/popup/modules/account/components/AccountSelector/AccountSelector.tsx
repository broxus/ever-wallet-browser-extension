import { memo } from 'react'

import { Checkbox } from '@app/popup/modules/shared'
import { convertPublicKey } from '@app/shared'

import styles from './AccountSelector.module.scss'


interface Props {
    preselected?: boolean;
    checked?: boolean;
    setChecked: (checked: boolean) => void;
    publicKey: string;
    keyName?: string;
    index?: string;
}

export const AccountSelector = memo((props: Props): JSX.Element => {
    const { preselected, checked, setChecked, publicKey, keyName, index } = props

    return (
        <Checkbox
            labelPosition="before"
            className={styles.checkbox}
            checked={Boolean(checked || preselected)}
            disabled={preselected}
            onChange={(e) => setChecked(e.target.checked)}
        >
            <div className={styles.wrap}>
                <span className={styles.index}>
                    {index}.
                </span>
                <span className={styles.name}>
                    {keyName || convertPublicKey(publicKey)}
                </span>
            </div>
        </Checkbox>
    )
})
