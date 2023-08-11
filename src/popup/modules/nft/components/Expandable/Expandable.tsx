import classNames from 'classnames'
import { memo, PropsWithChildren, useLayoutEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import styles from './Expandable.module.scss'

type Props = PropsWithChildren<{
    className?: string;
}>

export const Expandable = memo(({ className, children }: Props): JSX.Element => {
    const [expanded, setExpanded] = useState<boolean>()
    const ref = useRef<HTMLDivElement>(null)
    const intl = useIntl()

    useLayoutEffect(() => {
        if (!ref.current) return

        if (ref.current.clientHeight < ref.current.scrollHeight) {
            setExpanded(false)
        }
    }, [children])

    return (
        <div className={className}>
            <div
                ref={ref}
                className={classNames(styles.content, {
                    [styles._expandable]: expanded === false,
                    [styles._expanded]: expanded,
                })}
            >
                {children}
            </div>
            <button type="button" className={styles.more} onClick={() => setExpanded(true)}>
                {intl.formatMessage({ id: 'NFT_DESC_SHOW_MORE_BTN_TEXT' })}
            </button>
        </div>
    )
})
