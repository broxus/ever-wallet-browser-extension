import CopyToClipboard from 'react-copy-to-clipboard'
import { useIntl } from 'react-intl'
import { Tooltip } from 'react-tooltip'
import { CSSProperties, PropsWithChildren, useState } from 'react'

type Place = 'top' | 'right' | 'bottom' | 'left';

type Props = PropsWithChildren<{
    className?: string
    id?: string
    place?: Place
    text: string
}>;

const style: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
}

export function CopyText({ children, className, id, place = 'top', text }: Props): JSX.Element {
    const intl = useIntl()
    const [isCopied, setCopied] = useState(false)

    return (
        <>
            <CopyToClipboard
                text={text}
                onCopy={() => setCopied(true)}
            >
                <span
                    id={id}
                    className={className}
                    title={text}
                    onMouseEnter={() => setCopied(false)}
                >
                    {children || text}
                </span>
            </CopyToClipboard>
            <Tooltip
                variant="dark"
                anchorId={id}
                style={style}
                place={place}
                content={isCopied
                    ? intl.formatMessage({ id: 'COPIED_TOOLTIP' })
                    : intl.formatMessage({ id: 'CLICK_TO_COPY_TOOLTIP' })}
            />
        </>
    )
}
