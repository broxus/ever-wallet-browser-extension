import { Children, memo, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'

import './List.scss'

type Props = PropsWithChildren<{
    className?: string;
}>

type ItemProps = {
    icon: JSX.Element;
    name: ReactNode;
    info?: ReactNode;
    className?: string;
    active?: boolean;
    addon?: ReactNode;
    onClick(): void;
};

const ListInternal = memo(({ className, children }: Props): JSX.Element => (
    <ul className={classNames('acccounts-management-list', className)}>
        {children}
    </ul>
))

const Item = memo(({ icon, name, info, className, active, addon, onClick }: ItemProps): JSX.Element => (
    <li
        className={classNames('acccounts-management-list__item', { _active: active }, className)}
        onClick={onClick}
    >
        <div className="acccounts-management-list__item-icon">{icon}</div>
        <div className="acccounts-management-list__item-content">
            <div className="acccounts-management-list__item-name">
                {name}
            </div>
            <div className="acccounts-management-list__item-info">
                {info}
            </div>
        </div>
        {addon && (
            <div className="acccounts-management-list__item-addon" onClick={(e) => e.stopPropagation()}>
                {addon}
            </div>
        )}
    </li>
))


export const List = ListInternal as typeof ListInternal & {
    Item: typeof Item;
}

List.Item = Item
