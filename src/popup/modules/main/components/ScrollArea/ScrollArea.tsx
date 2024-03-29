import { HTMLAttributes, useRef } from 'react'

import { ScrollAreaContext } from './ScrollAreaContext'

type Props = HTMLAttributes<HTMLDivElement>;

export function ScrollArea(props: Props): JSX.Element {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <ScrollAreaContext.Provider value={ref}>
            <div {...props} ref={ref} />
        </ScrollAreaContext.Provider>
    )
}
