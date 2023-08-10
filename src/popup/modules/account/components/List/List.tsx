import { memo, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'
import { RoundedIcon } from '@app/popup/modules/shared'

import styles from './List.module.scss'

type Props = PropsWithChildren<{
    title: ReactNode;
    className?: string;
}>

type ItemProps = {
    icon: ReactNode;
    name: ReactNode;
    info?: ReactNode;
    className?: string;
    active?: boolean;
    addon?: ReactNode;
    onClick?(): void;
};

const ListInternal = memo(({ className, title, children }: Props): JSX.Element => (
    <div className={classNames(styles.pane, className)}>
        <h2>{title}</h2>
        <div className={styles.list}>
            {children}
        </div>
    </div>
))

const Item = memo(({ icon, name, info, className, active, addon, onClick }: ItemProps): JSX.Element => (
    <div className={classNames(styles.item, className)} onClick={onClick}>
        <RoundedIcon icon={icon} />
        <div className={styles.itemContent}>
            <div className={styles.itemName}>{name}</div>
            <div className={styles.itemInfo}>{info}</div>
        </div>
        {active && (
            <div className={styles.check}>
                {Icons.check}
            </div>
        )}
        {addon && (
            <div className={styles.itemAddon} onClick={(e) => e.stopPropagation()}>
                {addon}
            </div>
        )}
    </div>
))


export const List = ListInternal as typeof ListInternal & {
    Item: typeof Item;
}

List.Item = Item
