import { Children, cloneElement, memo, PropsWithChildren, ReactElement, ReactNode } from 'react'
import classNames from 'classnames'

import { Container, Content } from '../layout'
import { Button } from '../Button'
import { useResolve } from '../../hooks'
import { SlidingPanelHandle } from '../../store'
import styles from './SettingsMenu.module.scss'


type Props = PropsWithChildren<{
    title: ReactNode;
}>

type ItemProps = PropsWithChildren<{
    icon: JSX.Element;
    disabled?: boolean;
    danger?: boolean;
    onClick(): void;
}>;

const SettingsMenuInternal = memo(({ title, children }: Props): JSX.Element => {
    const handle = useResolve(SlidingPanelHandle)

    return (
        <Container>
            <Content>
                <h2>{title}</h2>
                <div className={styles.menu}>
                    {Children.map(children, (child) => {
                        const item = child as ReactElement<ItemProps>
                        if (!item || !('onClick' in item.props)) return child
                        return cloneElement(item, {
                            onClick: () => {
                                handle.close()
                                item.props.onClick()
                            },
                        })
                    })}
                </div>
            </Content>
        </Container>
    )
})

const Item = memo(({ icon, children, disabled, danger, onClick }: ItemProps): JSX.Element => (
    <Button
        design="ghost"
        className={classNames(styles.item, { [styles._danger]: danger })}
        disabled={disabled}
        onClick={onClick}
    >
        {children}
        {icon}
    </Button>
))

export const SettingsMenu = SettingsMenuInternal as typeof SettingsMenuInternal & {
    Item: typeof Item;
}

SettingsMenu.Item = Item
