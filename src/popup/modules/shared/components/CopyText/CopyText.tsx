import CopyToClipboard from 'react-copy-to-clipboard'
import { useIntl } from 'react-intl'
import ReactTooltip from 'react-tooltip'
import { PropsWithChildren, useEffect, useState } from 'react'

type Place = 'top' | 'right' | 'bottom' | 'left';

type Props = PropsWithChildren<{
    className?: string
    id?: string
    place?: Place
    text: string
}>;

export function CopyText({ children, className, id, place = 'top', text }: Props): JSX.Element {
    const intl = useIntl()
    const [isCopied, setCopied] = useState(false)

    useEffect(() => {
        ReactTooltip.rebuild()
    }, [isCopied])

    return (
        <>
            <CopyToClipboard
                text={text}
                onCopy={() => setCopied(true)}
            >
                <span
                    className={className}
                    data-tip=""
                    data-for={id}
                    onMouseLeave={() => setCopied(false)}
                >
                    {children || text}
                </span>
            </CopyToClipboard>
            <ReactTooltip
                id={id}
                type="dark"
                effect="solid"
                place={place}
                getContent={() => (
                    isCopied
                        ? intl.formatMessage({ id: 'COPIED_TOOLTIP' })
                        : intl.formatMessage({ id: 'CLICK_TO_COPY_TOOLTIP' })
                )}
            />
        </>
    )
}
