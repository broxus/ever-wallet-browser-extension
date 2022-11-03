import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import type { Nft, NftCollection } from '@app/models'
import { useResolve } from '@app/popup/modules/shared'

import { NftStore } from '../../store'

import './NftItem.scss'

interface Props {
    item: Nft | NftCollection;
    layout: 'tile' | 'row';
    className?: string;
    onClick?: () => void;
}

export const NftItem = observer(({ item, layout, className, onClick }: Props): JSX.Element => (
    <div
        className={classNames('nft-item', `_layout-${layout}`, className)}
        onClick={onClick}
    >
        <div className="nft-item__preview">
            {item.preview && (
                <img className="nft-item__preview-img" src={item.preview} alt="" />
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
