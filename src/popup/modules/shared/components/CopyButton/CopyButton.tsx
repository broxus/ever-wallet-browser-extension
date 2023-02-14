import { cloneElement, CSSProperties, ReactElement, useCallback, useMemo, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useIntl } from 'react-intl'
import { PlacesType, Tooltip } from 'react-tooltip'

type Props = {
    text: string;
    children: ReactElement;
    place?: PlacesType;
};

const style: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
}

let globalId = 0

export function CopyButton({ children, text, place }: Props): JSX.Element {
    const [isOpen, setIsOpen] = useState(false)
    const intl = useIntl()
    const id = useMemo(() => `copy-button-${globalId++}`, [])

    const handleCopy = useCallback(() => setTimeout(() => setIsOpen(false), 2000), [])

    return (
        <>
            <CopyToClipboard text={text} onCopy={handleCopy}>
                {cloneElement(children, {
                    id,
                    'data-tooltip-content': intl.formatMessage({ id: 'COPIED_TOOLTIP' }),
                    'data-tooltip-events': 'click',
                })}
            </CopyToClipboard>
            <Tooltip
                variant="dark"
                place={place ?? 'top'}
                anchorId={id}
                style={style}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
            />
        </>
    )
}
