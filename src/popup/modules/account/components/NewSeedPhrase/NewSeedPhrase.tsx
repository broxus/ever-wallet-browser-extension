import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, CopyButton, Footer, Header, Navbar, SeedList, Space } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

interface Props {
    seedWords: string[];
    onNext(): void;
    onBack(): void;
}

export const NewSeedPhrase = memo(({ seedWords, onNext, onBack }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'ADD_SEED_PANEL_SAVE_HEADER' })}
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="s">
                    <SeedList words={seedWords} />

                    <CopyButton text={seedWords.join(' ')}>
                        <Button design="ghost">
                            {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                            {Icons.copy}
                        </Button>
                    </CopyButton>
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="accent" onClick={onNext}>
                        {intl.formatMessage({ id: 'WROTE_ON_PAPER_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
