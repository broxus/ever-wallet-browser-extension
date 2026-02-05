import { Button } from '@app/popup/modules/shared'
import React from 'react'
import { useIntl } from 'react-intl'
import styles from './EnterSeed.module.scss'

type ClearModalProps = {
    onCancel(): void;
    onClear(): void;
}


export const ClearModal = ({ onCancel, onClear }: ClearModalProps) => {
    const intl = useIntl()

    return (
        <div className={styles.modalContent}>
            <p className={styles.modalDescription}>
                Are you sure you want to clear all entered words?
                This action will remove your entire seed phrase from the form.
            </p>
            <div className={styles.buttons}>
                <Button design="neutral" onClick={onCancel}>{intl.formatMessage({ id: 'CANCEL' })}</Button>
                <Button design="destructive" onClick={onClear}>{intl.formatMessage({ id: 'CLEAR_ALL' })}</Button>
            </div>
        </div>
    )
}
