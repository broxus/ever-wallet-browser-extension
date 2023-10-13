import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { useResolve } from '@app/popup/modules/shared'

import { StandaloneStore } from '../../store'
import styles from './WebsiteIcon.module.scss'

interface Props {
    origin: string;
    iconSize?: 'm' | 'l';
}

export const WebsiteIcon = observer(({ origin, iconSize = 'm' }: Props) => {
    const { state: { domainMetadata }} = useResolve(StandaloneStore)

    return (
        <div className={styles.container}>
            {domainMetadata?.icon && (
                <img
                    className={classNames(styles.img, styles[`_size-${iconSize}`])}
                    src={domainMetadata?.icon}
                    alt=""
                />
            )}
            <div className={styles.origin} title={origin}>
                {origin}
            </div>
        </div>
    )
})
