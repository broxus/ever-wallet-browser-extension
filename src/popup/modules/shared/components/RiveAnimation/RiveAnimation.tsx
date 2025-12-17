import { memo } from 'react'
import { useRive } from '@rive-app/react-canvas-lite'

type Props = {
    src: string;
    className?: string;
}

export const RiveAnimation = memo(({ src, className }: Props) => {
    const { RiveComponent } = useRive({ src, autoplay: true })

    return (<RiveComponent className={className} />)
})
