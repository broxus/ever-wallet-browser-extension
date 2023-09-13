import { memo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Navbar, SeedList } from '@app/popup/modules/shared'

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
                <SeedList words={seedWords} />
            </Content>

            <Footer>
                <Button onClick={onNext}>
                    {intl.formatMessage({ id: 'WROTE_ON_PAPER_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
