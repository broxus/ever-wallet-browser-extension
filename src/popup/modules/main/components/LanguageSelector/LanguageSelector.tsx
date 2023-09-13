import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Container, Content, Header, LOCALES, Navbar, useViewModel, useWhiteBg } from '@app/popup/modules/shared'

import { LanguageFlag } from '../LanguageFlag'
import { LanguageSelectorViewModel } from './LanguageSelectorViewModel'
import styles from './LanguageSelector.module.scss'

export const LanguageSelector = observer((): JSX.Element => {
    const vm = useViewModel(LanguageSelectorViewModel)
    const intl = useIntl()

    useWhiteBg()

    return (
        <Container>
            <Header>
                <Navbar back="/settings">
                    {intl.formatMessage({ id: 'LANGUAGE_SELECTOR_TITLE' })}
                </Navbar>
            </Header>

            <Content>
                <div>
                    {LOCALES.map(({ name, title, engTitle }) => (
                        <button
                            key={name}
                            type="button"
                            className={styles.btn}
                            onClick={() => vm.setLocale(name)}
                        >
                            <LanguageFlag className={styles.icon} lang={name} />
                            {engTitle ? `${engTitle} (${title})` : title}
                            {vm.selectedLocale === name && <Icons.Check className={styles.check} />}
                        </button>
                    ))}
                </div>
            </Content>
        </Container>
    )
})
