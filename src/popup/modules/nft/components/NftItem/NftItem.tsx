import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import type { Nft, NftCollection } from '@app/models'
import { useResolve } from '@app/popup/modules/shared'

import { GridLayout, NftStore } from '../../store'
import { NftImg } from '../NftImg'

import './NftItem.scss'

interface Props {
    item: Nft | NftCollection;
    layout: GridLayout;
    className?: string;
}

export const NftItem = observer(({ item, layout, className }: Props): JSX.Element => (
    <div className={classNames('nft-item', `_layout-${layout}`, className)}>
        <div className="nft-item__preview">
            {item.preview && (
                <NftImg src={item.preview} />
            )}
        </div>
        <div className="nft-item__content">
            {isNft(item) && (
                <div className="nft-item__collection">
                    {useResolve(NftStore).collections[item.collection]?.name}
                </div>
            )}
            {item.name && (
                <div className="nft-item__name">
                    {item.name}
                </div>
            )}
        </div>
    </div>
))

function isNft(item: Nft | NftCollection): item is Nft {
    return 'collection' in item
}
