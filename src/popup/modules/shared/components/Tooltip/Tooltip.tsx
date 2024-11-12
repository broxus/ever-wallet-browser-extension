import { ITooltip, Tooltip as ReactTooltip } from 'react-tooltip'
import { CSSProperties, memo } from 'react'

interface Props {
    design: 'primary' | 'secondary'
}

export const Tooltip = memo(({ design, ...props }: ITooltip & Props) => (
    <ReactTooltip
        {...props}
        variant="light"
        style={{
            ...getStyle(design),
            ...props.style,
        }}
        noArrow
    />
))

const stylePrimary: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: '#454A77',
    color: '#9193B1',
    zIndex: 200,
    boxShadow: '0px 0px 45px rgba(0, 0, 0, 0.50)',
    opacity: 1,
}

const styleSecondary: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    padding: '6px 8px',
    borderRadius: '8px',
    backgroundColor: '#e8e8e8',
    zIndex: 200,
    boxShadow: '0px 0px 45px rgba(0, 0, 0, 0.50)',
    opacity: 1,
}

function getStyle(design: Props['design']): CSSProperties {
    switch (design) {
        case 'primary': return stylePrimary
        case 'secondary': return styleSecondary
        default: return stylePrimary
    }
}
