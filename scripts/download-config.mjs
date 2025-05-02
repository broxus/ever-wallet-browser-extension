import fs from 'fs'
import fetch from 'node-fetch'

const url = 'https://raw.githubusercontent.com/alexlexan/Blog/refs/heads/master/networks_config.json'


async function downloadJson(env) {
    try {
        const response = await fetch(url, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error(`Error download: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()

        fs.writeFileSync(`./src/shared/config/extension_networks_config_${env}.json`, JSON.stringify(data, null, 2), 'utf8')
    }
    catch (error) {
        console.error('Error:', error)
    }
}

downloadJson('prod')
downloadJson('beta')
