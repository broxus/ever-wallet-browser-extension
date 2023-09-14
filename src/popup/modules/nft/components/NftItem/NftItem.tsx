import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import type { Nft, NftCollection } from '@app/models'
import { Icon } from '@app/popup/modules/shared'

import { GridLayout } from '../../store'
import { NftImg } from '../NftImg'
import styles from './NftItem.module.scss'

interface Props {
    item: Nft | NftCollection;
    layout: GridLayout;
    className?: string;
    label?: string;
}

export const NftItem = observer(({ item, layout, className, label }: Props): JSX.Element => (
    <div className={classNames(styles.nftItem, styles[`_layout-${layout}`], className)}>
        <div className={styles.preview}>
            {item.preview && (
                <NftImg src={item.preview} />
            )}
        </div>
        {item.name && (
            <div className={styles.name} title={item.name}>
                {item.name}
            </div>
        )}
        {isNft(item) && item.balance && item.supply && !label && (
            <div className={styles.balance} title={`${item.balance}/${item.supply}`}>
                {`${item.balance}/${item.supply}`}
            </div>
        )}
        {label && (
            <div className={styles.label}>{label}</div>
        )}
        <Icon icon="chevronRight" className={styles.chevron} />
    </div>
))

function isNft(item: Nft | NftCollection): item is Nft {
    return 'collection' in item
}
