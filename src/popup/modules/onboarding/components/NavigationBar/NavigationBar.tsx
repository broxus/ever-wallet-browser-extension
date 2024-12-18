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
    loading?: boolean;
}

export const NavigationBar = memo(({ onNext, onSkip, onBack, disabled, loading }: Props): JSX.Element => {
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
        <Space direction="column" gap="l">
            <div className={s.container}>
                <Space direction="row" gap="l">
                    <Button
                        design="neutral" onClick={onBack} size="m"
                        shape="pill"
                    >
                        {Icons.arrowLeft}
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button
                        type="submit"
                        disabled={disabled}
                        loading={loading}
                        onClick={onNext}
                        design="accent"
                        size="m"
                        shape="pill"
                    >
                        {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        {Icons.arrowRight}
                    </Button>
                </Space>
            </div>
            {onSkip
                && (
                    <Button design="ghost" onClick={onSkip}>
                        {intl.formatMessage({ id: 'CREATE_SEED_SKIP_BTN_TEXT' })}
                    </Button>
                )}
        </Space>
    )
})
