import { Observer, observer } from 'mobx-react-lite'
import Select, { Option } from 'rc-select'

import { LOCALES, useViewModel } from '@app/popup/modules/shared'

import { LanguageSelectorStore } from './LanguageSelectorViewModel'
import s from './LanguageSelector.module.scss'

export const LanguageSelector = observer((): JSX.Element => {
    const { selectedLocale, setLocale } = useViewModel(LanguageSelectorStore)
    return (
        <Observer>
            {() => (
                <Select
                    className={s.select} value={selectedLocale}
                    onChange={(e) => {
                        setLocale(e)
                    }}
                >
                    {LOCALES.map(({ name, title, engTitle }) => (
                        <Option
                            value={name}
                            key={name}
                        >
                            {engTitle ? `${engTitle} (${title})` : title}
                        </Option>
                    ))}
                </Select>
            )}
        </Observer>
    )
})
