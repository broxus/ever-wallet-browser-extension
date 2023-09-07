const SCHEME_PATTERN = /^https?:\/\//

export function isValidURL(url: string | undefined): boolean {
    if (!url) return true

    try {
        // eslint-disable-next-line unused-imports/no-unused-vars-ts
        const _url = new URL(url.match(SCHEME_PATTERN) ? url : `http://${url}`)
    }
    catch {
        return false
    }

    return true
}
