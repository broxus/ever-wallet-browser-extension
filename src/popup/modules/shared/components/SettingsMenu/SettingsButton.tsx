import { PropsWithChildren, useCallback } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'

import { useResolve } from '../../hooks'
import { SlidingPanelStore } from '../../store'
import { SettingsMenu } from './SettingsMenu'
import styles from './SettingsButton.module.scss'

type Props = PropsWithChildren<{
    title?: string;
    className?: string;
}>

const SettingsButtonInternal = observer(({ className, title, children }: Props): JSX.Element => {
    const store = useResolve(SlidingPanelStore)
    const handleClick = useCallback(() => {
        store.open({
            render: () => (
                <SettingsMenu title={title}>
                    {children}
                </SettingsMenu>
            ),
        })
    }, [])

    return (
        <button
            type="button"
            className={classNames(styles.button, className)}
            onClick={handleClick}
        >
            {Icons.settings}
        </button>
    )
})

export const SettingsButton = SettingsButtonInternal as typeof SettingsButtonInternal & {
    Item: typeof SettingsMenu.Item;
}

SettingsButton.Item = SettingsMenu.Item
