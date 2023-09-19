import { observer } from 'mobx-react-lite'

import { LOCALES, Select, useViewModel } from '@app/popup/modules/shared'

import { LanguageSelectorStore } from './LanguageSelectorViewModel'
import s from './LanguageSelector.module.scss'

export const LanguageSelector = observer((): JSX.Element => {
    const { selectedLocale, setLocale } = useViewModel(LanguageSelectorStore)
    const options = LOCALES.map(({ name, title }) => ({
        label: title,
        value: name,
    }))

    return (
        <Select
            className={s.select}
            value={selectedLocale}
            options={options}
            onChange={setLocale}
        />
    )
})
