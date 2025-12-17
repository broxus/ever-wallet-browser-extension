import { type PropsWithChildren, type ReactPortal, type Ref } from 'react'
import { createPortal } from 'react-dom'

type Props = PropsWithChildren<{
    id: string;
    ref?: Ref<HTMLElement>
}>

const containers = new Map<string, HTMLElement>()

export const Portal = ({ id, children, ref }: Props): ReactPortal => {
    let container = containers.get(id) ?? null

    if (!container) {
        container = document.getElementById(id)
    }

    if (!container) {
        container = window.document.createElement('div')
        container.id = id

        window.document.body.appendChild(container)
    }

    containers.set(id, container)

    if (ref) {
        if (typeof ref === 'function') {
            ref(container)
        }
        else {
            ref.current = container
        }
    }

    return createPortal(children, container)
}
