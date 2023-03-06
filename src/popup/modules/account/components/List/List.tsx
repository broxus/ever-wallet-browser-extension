import { Children, memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import ArrowIcon from '@app/popup/assets/icons/arrow-right.svg'

import './List.scss'

type Props = PropsWithChildren<{
    className?: string;
}>

type ItemProps = PropsWithChildren<{
    icon: JSX.Element;
    className?: string;
    active?: boolean;
    onClick(): void;
}>;

const ListInternal = memo(({ className, children }: Props): JSX.Element => {
    return (
        <ul className={classNames('acccounts-management-list', className)}>
            {Children.map(children, (child) => (
                <li className="acccounts-management-list__li">{child}</li>
            ))}
        </ul>
    )
})

const Item = memo(({ icon, children, className, active, onClick }: ItemProps): JSX.Element => (
    <div
        className={classNames('acccounts-management-list__item', { _active: active }, className)}
        onClick={onClick}
    >
        <div className="acccounts-management-list__item-icon">{icon}</div>
        <div className="acccounts-management-list__item-content">{children}</div>
        <ArrowIcon className="acccounts-management-list__item-arrow" />
    </div>
))


export const List = ListInternal as typeof ListInternal & {
    Item: typeof Item;
}

List.Item = Item
