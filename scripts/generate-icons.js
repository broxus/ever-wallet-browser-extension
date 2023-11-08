const fs = require('fs')
const path = require('path')

const ICONS_DIR = path.resolve(__dirname, '../src/popup/assets/icons')
const ICONS_FILE = path.resolve(__dirname, '../src/popup/icons.tsx')

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function snakeToCamel(value) {
    const [start, ...rest] = value.split('-')
    return start + rest.map(capitalize).join('')
}

const files = fs.readdirSync(ICONS_DIR)
const icons = files.map((file) => {
    const name = snakeToCamel(file.replace('.svg', ''))
    const component = capitalize(name)

    return {
        file,
        name,
        component,
    }
})

const generated = `/* eslint-disable */
import type { ReactNode } from 'react'
${icons.map(({ component, file }) => `import ${component} from '@app/popup/assets/icons/${file}'`).join('\n')}

// GENERATED CODE - DO NOT MODIFY BY HAND
export class Icons {
${icons.map(({ name, component }) => `public static readonly ${name}: ReactNode = <${component} />`).join('\n')}
}
`

fs.writeFile(ICONS_FILE, generated, { flag: 'w' }, (err) => {
    if (err) throw err
    console.log('DONE!')
})
