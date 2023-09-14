import { cloneElement, memo, ReactSVGElement, SVGProps } from 'react'

import { Icons } from '@app/popup/icons'

type Props = SVGProps<SVGElement> & {
    icon: keyof typeof Icons
}

export const Icon = memo(({ icon, ...props }: Props) => {
    const element = Icons[icon] as ReactSVGElement
    if (Object.keys(props).length === 0) return element
    return cloneElement(element, props)
})
