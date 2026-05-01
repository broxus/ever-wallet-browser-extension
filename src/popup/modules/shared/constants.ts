export const LOCALES = [
    { name: 'en', title: 'English' },
    { name: 'ko', title: '한국어', engTitle: 'Korean' },
    { name: 'ja', title: '日本語', engTitle: 'Japanese' },
    { name: 'id', title: 'Bahasa Indonesia', engTitle: 'Indonesian' },
]

export const enum NETWORK {
    VENOM = 8,
    TYCHO_TESTNET = 1000,
    EVERSCALE_RPC = 0,
    EVERSCALE_GQL = 1,
    EVERSCALE_TESTNET = 4,
    LOCAL = 100,
}

export const DATETIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
})
