import { ClipboardEventHandler, memo, useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, Container, Content, ErrorMessage, Footer, Form, Header, Navbar, Space } from '@app/popup/modules/shared'

import { ImportSeedInput } from './ImportSeedInput'

interface Props {
    error?: string;
    wordsCount: number;
    getBip39Hints: (word: string) => string[];
    onSubmit(words: string[]): void;
    onBack(): void;
}

export const ImportSeed = memo(({ error, wordsCount, getBip39Hints, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const form = useForm({ mode: 'all' })

    const numbers = useMemo(
        () => new Array(wordsCount).fill(1).map((_, i) => i + 1),
        [wordsCount],
    )

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = useCallback(event => {
        try {
            const seedPhrase = event.clipboardData.getData('text/plain')
            const words = seedPhrase
                .replace(/\r\n|\r|\n/g, ' ')
                .replace(/\s\s+/g, ' ')
                .split(' ')
                .slice(0, wordsCount)

            if (words.length > 0 && words.length <= wordsCount) {
                setTimeout(() => {
                    words.forEach((word, idx) => {
                        form.setValue(`word${idx + 1}`, word, {
                            shouldValidate: true,
                        })
                    })
                }, 0)
            }
        }
        catch (e: any) {
            console.error(e.message)
        }
    }, [form])

    const submit = useCallback((data: Record<string, string>) => onSubmit(Object.values(data)), [onSubmit])

    return (
        <Container>
            <Header>
                <Navbar back={onBack} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'IMPORT_SEED_PANEL_HEADER' })}</h2>

                <FormProvider {...form}>
                    <Form id="words" onSubmit={form.handleSubmit(submit)} onPaste={onPaste}>
                        <Space direction="row" gap="s">
                            <Space direction="column" gap="s">
                                {numbers.slice(0, wordsCount / 2).map(number => (
                                    <ImportSeedInput
                                        key={number}
                                        index={number}
                                        name={`word${number}`}
                                        getBip39Hints={getBip39Hints}
                                    />
                                ))}
                            </Space>
                            <Space direction="column" gap="s">
                                {numbers.slice(wordsCount / 2, wordsCount).map(number => (
                                    <ImportSeedInput
                                        key={number}
                                        index={number}
                                        name={`word${number}`}
                                        getBip39Hints={getBip39Hints}
                                    />
                                ))}
                            </Space>
                        </Space>

                        <ErrorMessage>{error}</ErrorMessage>
                    </Form>
                </FormProvider>
            </Content>

            <Footer>
                <Button form="words" type="submit" disabled={!form.formState.isValid}>
                    {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
