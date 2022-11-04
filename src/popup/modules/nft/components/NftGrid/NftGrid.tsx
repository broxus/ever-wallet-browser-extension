import { PropsWithChildren, memo, FunctionComponent, HTMLProps } from 'react'
import classNames from 'classnames'

import CardIcon from '@app/popup/assets/icons/card.svg'
import MenuIcon from '@app/popup/assets/icons/menu.svg'

import './NftGrid.scss'

type Props = PropsWithChildren<{
    layout: 'tile' | 'row';
    title: string;
    className?: string;
    onLayoutChange: (layout: 'tile' | 'row') => void;
}>

function Grid({ title, children, layout, className, onLayoutChange }: Props): JSX.Element {
    return (
        <div className={classNames('nft-grid', `_layout-${layout}`, className)}>
            <div className="nft-grid__header">
                <div className="nft-grid__header-title">{title}</div>
                <div className="nft-grid__header-controls">
                    <button
                        type="button"
                        className={classNames('nft-grid__btn', { _active: layout === 'row' })}
                        onClick={() => onLayoutChange('row')}
                    >
                        <MenuIcon />
                    </button>
                    <button
                        type="button"
                        className={classNames('nft-grid__btn', { _active: layout === 'tile' })}
                        onClick={() => onLayoutChange('tile')}
                    >
                        <CardIcon />
                    </button>
                </div>
            </div>
            <div className="nft-grid__grid">
                {children}
            </div>
        </div>
    )
}

function Item({ children, className, ...props }: HTMLProps<any>): JSX.Element {
    return (
        <div className={classNames('nft-grid__grid-item', className)} {...props}>
            {children}
        </div>
    )
}

export const NftGrid = memo(Grid) as any as typeof Grid & {
    Item: FunctionComponent<HTMLProps<any>>;
}

NftGrid.Item = Item as any
