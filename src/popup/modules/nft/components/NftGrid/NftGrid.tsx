import { FunctionComponent, HTMLProps, memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import { Icons } from '@app/popup/icons'
import { Button, Icon } from '@app/popup/modules/shared'

import { GridLayout } from '../../store'
import styles from './NftGrid.module.scss'

type Props = PropsWithChildren<{
    layout: GridLayout;
    title: string;
    className?: string;
    compact?: boolean;
    onLayoutChange?: (layout: GridLayout) => void;
    onTypeChange?: () => void;
}>;

const Grid = memo(
    ({ title, children, layout, className, compact, onLayoutChange, onTypeChange }: Props): JSX.Element => (
        <div className={classNames(styles.nftGrid, styles[`_layout-${layout}`], { [styles._compact]: compact }, className)}>
            {onLayoutChange && (
                <div className={styles.header}>
                    <div className={styles.headerTitle}>{title}</div>
                    <div className={styles.headerControls}>
                        {onTypeChange && (
                            <Button
                                shape="square" size="s" design="neutral"
                                onClick={onTypeChange} tabIndex={-1}
                            >
                                <Icon icon="settings1" width={16} height={16} />
                            </Button>
                        )}
                        <div className={styles.layoutControls}>
                            <button type="button" className={classNames(styles.headerBtn, { [styles._active]: layout === 'tile' })} onClick={() => onLayoutChange('tile')}>
                                {Icons.card}
                            </button>
                            <button type="button" className={classNames(styles.headerBtn, { [styles._active]: layout === 'row' })} onClick={() => onLayoutChange('row')}>
                                {Icons.list}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.grid}>{children}</div>
        </div>
    ),
)

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
