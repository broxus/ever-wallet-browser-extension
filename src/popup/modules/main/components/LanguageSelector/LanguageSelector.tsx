import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Container, Content, Icon, LOCALES, useViewModel } from '@app/popup/modules/shared'

import { LanguageFlag } from '../LanguageFlag'
import { LanguageSelectorViewModel } from './LanguageSelectorViewModel'
import styles from './LanguageSelector.module.scss'

export const LanguageSelector = observer((): JSX.Element => {
    const vm = useViewModel(LanguageSelectorViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'LANGUAGE_SELECTOR_TITLE' })}</h2>
                <div className={styles.list}>
                    {LOCALES.map(({ name, title, engTitle }) => (
                        <button
                            key={name}
                            type="button"
                            className={styles.item}
                            onClick={() => vm.setLocale(name)}
                        >
                            <LanguageFlag className={styles.icon} lang={name} />
                            {engTitle ? `${engTitle} (${title})` : title}
                            {vm.selectedLocale === name && <Icon icon="check" className={styles.check} />}
                        </button>
                    ))}
                </div>
            </Content>
        </Container>
    )
})
