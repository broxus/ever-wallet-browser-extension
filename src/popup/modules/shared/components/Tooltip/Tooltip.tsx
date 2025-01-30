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

const commonStyle: CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    borderRadius: '8px',
    zIndex: 200,
    boxShadow: '0px 0px 45px rgba(0, 0, 0, 0.50)',
    opacity: 1,
    width: 244,
}

const stylePrimary: CSSProperties = {
    ...commonStyle,
    padding: '8px 12px',
    backgroundColor: '#7D81A7',
    color: '#fff',
}

const styleSecondary: CSSProperties = {
    ...commonStyle,
    padding: '6px 8px',
    backgroundColor: '#e8e8e8',
}

function getStyle(design: Props['design']): CSSProperties {
    switch (design) {
        case 'primary': return stylePrimary
        case 'secondary': return styleSecondary
        default: return stylePrimary
    }
}
