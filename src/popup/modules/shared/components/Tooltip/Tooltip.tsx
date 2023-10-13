import { ITooltip, Tooltip as ReactTooltip } from 'react-tooltip'
import { CSSProperties, memo } from 'react'

const tooltipStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    padding: '6px 8px',
    borderRadius: '8px',
    backgroundColor: '#e8e8e8',
    zIndex: 200,
}

export const Tooltip = memo((props: ITooltip) => (
    <ReactTooltip
        {...props}
        variant="light"
        style={tooltipStyle}
        noArrow
    />
))
