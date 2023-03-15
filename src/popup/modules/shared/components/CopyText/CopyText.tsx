import CopyToClipboard from 'react-copy-to-clipboard'
import { useIntl } from 'react-intl'
import { Tooltip } from 'react-tooltip'
import { CSSProperties, PropsWithChildren, useMemo, useState } from 'react'

type Place = 'top' | 'right' | 'bottom' | 'left';

type Props = PropsWithChildren<{
    text: string;
    className?: string;
    place?: Place;
    tooltipText?: string;
    noArrow?: boolean;
    style?: CSSProperties;
}>;

const baseStyle: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
}

let globalId = 0

export function CopyText(props: Props): JSX.Element {
    const { children, className, place = 'top', text, tooltipText, noArrow, style } = props
    const intl = useIntl()
    const [isCopied, setCopied] = useState(false)
    const id = useMemo(() => `copy-text-${globalId++}`, [])
    const combinedStyle = useMemo(() => ({
        ...baseStyle,
        ...style,
    }), [style])

    return (
        <>
            <CopyToClipboard text={text} onCopy={() => setCopied(true)}>
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
                anchorSelect={`#${id}`}
                noArrow={noArrow}
                style={combinedStyle}
                place={place}
                content={isCopied
                    ? intl.formatMessage({ id: 'COPIED_TOOLTIP' })
                    : (tooltipText ?? intl.formatMessage({ id: 'CLICK_TO_COPY_TOOLTIP' }))}
            />
        </>
    )
}
