import { memo, useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Button, Space } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import s from './NavigationBar.module.scss'


interface Props {
    onNext: () => void;
    onSkip?: () => void;
    onBack: () => void;
    disabled?: boolean;
}

export const NavigationBar = memo(({ onNext, onSkip, onBack, disabled }: Props): JSX.Element => {
    const intl = useIntl()

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            onNext()
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (

        <div className={s.navigationBar}>
            <div className={s.container}>
                <Space direction="row" gap="l">
                    <Button design="secondary" onClick={onBack}>
                        {Icons.arrowLeft}
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button onClick={onNext} type="submit" disabled={disabled}>
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        {Icons.arrowRight}
                    </Button>
                </Space>
            </div>
            {onSkip
                && (
                    <Button design="ghost" onClick={onSkip}>
                        {intl.formatMessage({ id: 'CHECK_YOUR_PHRASE' })}
                    </Button>
                )}
        </div>
    )
})
