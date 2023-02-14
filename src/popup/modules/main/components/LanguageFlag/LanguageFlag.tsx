import { memo } from 'react'

import GB from '@app/popup/assets/img/flag/gb.svg'
import ID from '@app/popup/assets/img/flag/id.svg'
import JP from '@app/popup/assets/img/flag/jp.svg'
import KR from '@app/popup/assets/img/flag/kr.svg'

const FLAGS: Record<string, string> = {
    en: GB,
    ko: KR,
    ja: JP,
    id: ID,
}

interface Props {
    lang: string;
    className?: string;
}

export const LanguageFlag = memo(({ lang, className }: Props): JSX.Element => (
    <img
        className={className}
        src={FLAGS[lang]}
        style={{ border: '1px solid #D4D7DC' }}
        alt=""
    />
))
