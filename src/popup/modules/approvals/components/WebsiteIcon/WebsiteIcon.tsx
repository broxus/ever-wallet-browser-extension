import { observer } from 'mobx-react-lite'

import { useResolve } from '@app/popup/modules/shared'

import { StandaloneStore } from '../../store'
import styles from './WebsiteIcon.module.scss'

interface Props {
    origin: string;
}

export const WebsiteIcon = observer(({ origin }: Props) => {
    const { state: { domainMetadata }} = useResolve(StandaloneStore)

    return (
        <div className={styles.container}>
            {domainMetadata?.icon && (
                <img
                    className={styles.img}
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
