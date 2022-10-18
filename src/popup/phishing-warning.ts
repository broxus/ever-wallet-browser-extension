import pump from 'pump'
import ObjectMultiplex from 'obj-multiplex'
import browser from 'webextension-polyfill'

import { ENVIRONMENT_TYPE_PHISHING_WARNING, PHISHING_SAFELIST } from '@app/shared/constants'
import { PortDuplexStream } from '@app/shared/PortDuplexStream'
import { ReconnectablePort } from '@app/shared/Port'
import { getUniqueId } from '@app/shared/utils'

import './styles/phishing-warning.scss'

if (window.top === window.self) {
    document.getElementById('antiClickjack')!.innerHTML = '#content__framed-body { display: none !important; }'
}

if (window.top === window.self) {
    start()
}
else {
    // The sub-frame case requires the "open in new tab" href to be set
    // dynamically because a relative `href` attribute would not preserve
    // the URL hash.
    setupOpenSelfInNewTabLink()
}

/**
 * Setup the "Open in new tab" link.
 *
 * This is necessary so that the "open in new tab" link includes the current
 * URL hash. A statically-set relative `href` would drop the URL hash.
 */
function setupOpenSelfInNewTabLink() {
    const newTabLink = window.document.getElementById('open-self-in-new-tab')
    if (!newTabLink) {
        throw new Error('Unable to locate "Open in new tab" link')
    }
    newTabLink.setAttribute('href', window.location.href)
}

/**
 * Checks to see if the suspectHref is a valid format to forward on
 * Specifically checks the protocol of the passed href.
 */
function isValidSuspectHref(href: string) {
    /* eslint-disable-next-line */
    const disallowedProtocols = ['javascript:']
    const parsedSuspectHref = new URL(href)

    return disallowedProtocols.indexOf(parsedSuspectHref.protocol) < 0
}

/**
 * Initialize the phishing warning page streams.
 */
function start() {
    const portStream = new PortDuplexStream(
        new ReconnectablePort(() => browser.runtime.connect({ name: ENVIRONMENT_TYPE_PHISHING_WARNING })),
    )
    const mux = new ObjectMultiplex()
    pump(portStream, mux, portStream, (error) => [
        console.error('Disconnected', error),
    ])
    const phishingSafelistStream = mux.createStream(PHISHING_SAFELIST)

    const { hash } = new URL(window.location.href)
    const hashContents = hash.slice(1) // drop leading '#' from hash
    const hashQueryString = new URLSearchParams(hashContents)
    const suspectHostname = hashQueryString.get('hostname')
    const suspectHref = hashQueryString.get('href')

    if (!suspectHostname) {
        throw new Error('Missing \'hostname\' query parameter')
    }
    else if (!suspectHref) {
        throw new Error('Missing \'href\' query parameter')
    }

    const continueLink = document.getElementById('unsafe-continue')
    if (!continueLink) {
        throw new Error('Unable to locate unsafe continue link')
    }

    if (!isValidSuspectHref(suspectHref)) {
        const redirectWarningMessage = document.getElementById(
            'redirect-warning-message',
        )
        if (redirectWarningMessage) {
            redirectWarningMessage.innerHTML = '<br />'
            redirectWarningMessage.innerText = 'This URL does not use a supported protocol so we won\'t give you the option to skip this warning.'
        }
    }

    continueLink.addEventListener('click', async () => {
        if (!isValidSuspectHref(suspectHref)) {
            console.log('Disallowed Protocol, cannot continue.')
            return
        }

        phishingSafelistStream.write({
            jsonrpc: '2.0',
            method: 'safelistPhishingDomain',
            params: [suspectHostname],
            id: getUniqueId(),
        })

        phishingSafelistStream.once('data', () => {
            window.location.href = suspectHref
        })
    })
}
