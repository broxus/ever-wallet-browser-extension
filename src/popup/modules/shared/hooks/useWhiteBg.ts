import { useEffect } from 'react'

// TODO: other page params?
export function useWhiteBg(): void {
    useEffect(() => {
        document.body.classList.add('bg-white')
        return () => document.body.classList.remove('bg-white')
    }, [])
}
