import { FunctionComponent, HTMLProps, memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'

import { GridLayout } from '../../store'
import styles from './NftGrid.module.scss'

type Props = PropsWithChildren<{
    layout: GridLayout;
    title: string;
    className?: string;
    compact?: boolean;
    onLayoutChange?: (layout: GridLayout) => void;
}>

const Grid = memo(({ title, children, layout, className, compact, onLayoutChange }: Props): JSX.Element => (
    <div className={classNames(styles.nftGrid, styles[`_layout-${layout}`], { [styles._compact]: compact }, className)}>
        {onLayoutChange && (
            <div className={styles.header}>
                <div className={styles.headerTitle}>{title}</div>
                <div className={styles.headerControls}>
                    <button
                        type="button"
                        className={classNames(styles.headerBtn, { [styles._active]: layout === 'tile' })}
                        onClick={() => onLayoutChange('tile')}
                    >
                        {Icons.card}
                    </button>
                    <button
                        type="button"
                        className={classNames(styles.headerBtn, { [styles._active]: layout === 'row' })}
                        onClick={() => onLayoutChange('row')}
                    >
                        {Icons.menu}
                    </button>
                </div>
            </div>
        )}
        <div className={styles.grid}>
            {children}
        </div>
    </div>
))

function Item({ children, className, ...props }: HTMLProps<any>): JSX.Element {
    return (
        <div className={classNames(styles.gridItem, className)} {...props}>
            {children}
        </div>
    )
}

export const NftGrid = Grid as typeof Grid & {
    Item: FunctionComponent<HTMLProps<any>>;
}

NftGrid.Item = Item as any
