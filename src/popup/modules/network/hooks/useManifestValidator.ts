import { useCallback, useState } from 'react'

let timeoutId = 0

export function useManifestValidator() {
    const [validating, setValidating] = useState(false)
    const validate = useCallback((url: string | undefined): Promise<boolean> => {
        clearTimeout(timeoutId)

        if (!url) {
            setValidating(false)
            return Promise.resolve(true)
        }

        setValidating(true)

        return new Promise((resolve) => {
            timeoutId = window.setTimeout(async () => {
                await resolve(_validate(url))
                setValidating(false)
            }, 300) // debounce 300 ms
        })
    }, [])

    return { validate, validating }
}

async function _validate(url: string): Promise<boolean> {
    try {
        const response = await fetch(url)
        const manifest = await response.json()

        if (!Array.isArray(manifest.tokens)) return false

        return (manifest.tokens as any[]).every(
            (token) => typeof token?.name === 'string'
                && typeof token?.address === 'string'
                && typeof token?.symbol === 'string'
                && typeof token?.decimals === 'number'
                && (typeof token?.logoURI === 'string' || typeof token?.logoURI === 'undefined'),
        )
    }
    catch (e) {
        return false
    }
}
