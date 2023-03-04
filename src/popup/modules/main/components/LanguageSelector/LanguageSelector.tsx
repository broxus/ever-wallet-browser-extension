import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Button, Container, Content, Footer, Header, LOCALES, useViewModel } from '@app/popup/modules/shared'

import { LanguageFlag } from '../LanguageFlag'
import { LanguageSelectorViewModel } from './LanguageSelectorViewModel'

import './LanguageSelector.scss'

interface Props {
    onBack(): void;
}

export const LanguageSelector = observer(({ onBack }: Props): JSX.Element => {
    const vm = useViewModel(LanguageSelectorViewModel)
    const intl = useIntl()

    return (
        <Container className="language-selector">
            <Header>
                <h2>{intl.formatMessage({ id: 'LANGUAGE' })}</h2>
            </Header>

            <Content className="language-selector__content">
                {LOCALES.map(({ name, title, engTitle }) => (
                    <button
                        key={name}
                        type="button"
                        className={classNames('language-selector__btn', { _active: vm.selectedLocale === name })}
                        onClick={() => vm.setLocale(name)}
                    >
                        <LanguageFlag className="account-settings__btn-icon" lang={name} />
                        {engTitle ? `${engTitle} (${title})` : title}
                    </button>
                ))}
            </Content>

            <Footer>
                <Button design="secondary" onClick={onBack}>
                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
