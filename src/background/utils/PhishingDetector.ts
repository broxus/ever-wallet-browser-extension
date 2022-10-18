import levenshtein from 'fast-levenshtein'

const DEFAULT_TOLERANCE = 3

/**
 * A configuration object for phishing detection.
 */
export interface PhishingDetectorConfig {
    /**
     * The name of this configuration. Used to explain to users why a site is being blocked.
     */
    name: string;
    /**
     * The current version of the configuration.
     */
    version: number;
    /**
     * Origins that should not be blocked.
     */
    allowlist: string[];
    /**
     * Origins to block.
     */
    blocklist: string[];
    /**
     * Origins of common phishing targets.
     */
    fuzzylist: string[];
    /**
     * Tolerance to use for the fuzzylist levenshtein match.
     */
    tolerance: number;
}

export interface PhishingDetectResult {
    name?: string;
    version?: number;
    result: boolean;
    match?: string; // Returned as undefined for non-fuzzy true results.
    type: 'all' | 'fuzzy' | 'blocklist' | 'allowlist';
}

interface ProcessedConfig {
    name: string;
    version: number;
    allowlist: string[][];
    blocklist: string[][];
    fuzzylist: string[][];
    tolerance: number;
}

export class PhishingDetector {

    private readonly configs: ProcessedConfig[]

    /**
     * Construct a phishing detector, which can check whether origins are known
     * to be malicious or similar to common phishing targets.
     *
     * A list of configurations is accepted. Each origin checked is processed
     * using each configuration in sequence, so the order defines which
     * configurations take precedence.
     */
    constructor(opts: PhishingDetectorConfig[]) {
        this.configs = processConfigs(opts)
    }

    check(domain: string): PhishingDetectResult {
        const fqdn = domain.substring(domain.length - 1) === '.' ? domain.slice(0, -1) : domain
        const source = domainToParts(fqdn)

        for (const { allowlist, name, version } of this.configs) {
            // if source matches whitelist domain (or subdomain thereof), PASS
            const whitelistMatch = matchPartsAgainstList(source, allowlist)
            if (whitelistMatch) return { name, result: false, type: 'allowlist', version }
        }

        for (const { blocklist, fuzzylist, name, tolerance, version } of this.configs) {
            // if source matches blacklist domain (or subdomain thereof), FAIL
            const blacklistMatch = matchPartsAgainstList(source, blocklist)
            if (blacklistMatch) return { name, result: true, type: 'blocklist', version }

            if (tolerance > 0) {
                // check if near-match of whitelist domain, FAIL
                let fuzzyForm = domainPartsToFuzzyForm(source)
                // strip www
                fuzzyForm = fuzzyForm.replace('www.', '')
                // check against fuzzylist
                const levenshteinMatched = fuzzylist.find((targetParts) => {
                    const fuzzyTarget = domainPartsToFuzzyForm(targetParts)
                    const distance = levenshtein.get(fuzzyForm, fuzzyTarget)
                    return distance <= tolerance
                })
                if (levenshteinMatched) {
                    const match = domainPartsToDomain(levenshteinMatched)
                    return { name, match, result: true, type: 'fuzzy', version }
                }
            }
        }

        // matched nothing, PASS
        return { result: false, type: 'all' }
    }

}

// util

function processConfigs(configs: PhishingDetectorConfig[] = []): ProcessedConfig[] {
    return configs.map((config) => ({
        ...config,
        allowlist: processDomainList(config.allowlist || []),
        blocklist: processDomainList(config.blocklist || []),
        fuzzylist: processDomainList(config.fuzzylist || []),
        tolerance: config.tolerance ?? DEFAULT_TOLERANCE,
    }))
}

function processDomainList(list: string[]): string[][] {
    return list.map(domainToParts)
}

function domainToParts(domain: string): string[] {
    try {
        return domain.split('.').reverse()
    }
    catch (e) {
        throw new Error(JSON.stringify(domain))
    }
}

function domainPartsToDomain(domainParts: string[]): string {
    return domainParts.slice().reverse().join('.')
}

// for fuzzy search, drop TLD and re-stringify
function domainPartsToFuzzyForm(domainParts: string[]): string {
    return domainParts.slice(1).reverse().join('.')
}

// match the target parts, ignoring extra subdomains on source
function matchPartsAgainstList(source: string[], list: string[][]): boolean {
    return list.some((target) => {
        // target domain has more parts than source, fail
        if (target.length > source.length) return false
        // source matches target or (is deeper subdomain)
        return target.every((part, index) => source[index] === part)
    })
}
