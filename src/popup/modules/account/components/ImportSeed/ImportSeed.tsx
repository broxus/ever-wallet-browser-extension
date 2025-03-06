import { ClipboardEventHandler, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, ConnectionStore, Container, Content, Footer, Form, Header, Navbar, NekotonToken, RadioButton, Space, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { UserMnemonic } from '@app/models'

import { ImportSeedInput } from './ImportSeedInput'
import styles from './ImportSeedInput.module.scss'

interface Props {
    wordsCount: number;
    getBip39Hints: (word: string) => string[];
    onSubmit(words: string[], userMnemonic?: UserMnemonic): void;
    onBack(): void;
}

export const ImportSeed = memo(({ wordsCount, getBip39Hints, onSubmit, onBack }: Props): JSX.Element => {
    const intl = useIntl()
    const form = useForm({ mode: 'all' })
    const nekoton = useResolve(NekotonToken)
    const { selectedConnectionNetworkType } = useResolve(ConnectionStore)

    const [userMnemonic, setUserMnemonic] = useState<UserMnemonic>()

    const values = form.watch()
    const isValid = form.formState.isValid

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
                            shouldDirty: true,
                            shouldTouch: true,
                        })
                    })
                }, 0)
            }
        }
        catch (e: any) {
            console.error(e.message)
        }
    }, [form])

    const submit = useCallback((data: Record<string, string>) => {
        onSubmit(Object.values(data), userMnemonic)
    }, [onSubmit, userMnemonic])

    const isBip39 = useMemo(() => {
        const words = Object.values(values).slice(0, wordsCount)
        if (isValid) {
            try {
                nekoton.validateMnemonic(words.join(' '), {
                    type: 'bip39',
                    data: { accountId: 0, path: 'ton', entropy: 'bits256' },
                })
                return true
            }
            catch (e) {
                console.warn(e)
                return false
            }
        }
        return undefined
    }, [values, isValid, wordsCount, nekoton])

    useEffect(() => {
        if (selectedConnectionNetworkType === 'ton' || selectedConnectionNetworkType === 'hamster') {
            setUserMnemonic(wordsCount === 24 ? (isBip39 ? 'TONBip39' : 'TONStandard') : 'TONTypesWallet')
        }
        else {
            setUserMnemonic(undefined)
        }
    }, [isBip39, wordsCount])

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'IMPORT_SEED_PANEL_HEADER' })}
                </Navbar>
            </Header>

            <Content>
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
                    </Form>
                </FormProvider>
            </Content>

            <Footer layer>
                {(selectedConnectionNetworkType === 'ton' || selectedConnectionNetworkType === 'hamster') && (
                    wordsCount === 24 ? (
                        <div className={styles.userMnemonic}>
                            <div className={styles.label}>
                                Seed phrase format:
                            </div>
                            <div className={styles.radio}>
                                <RadioButton
                                    labelPosition="after"
                                    value="test"
                                    checked={userMnemonic === 'TONStandard'}
                                    onChange={() => {
                                        setUserMnemonic('TONStandard')
                                    }}
                                >
                                    TON Standard
                                </RadioButton>
                                <RadioButton
                                    labelPosition="after"
                                    value="test"
                                    checked={userMnemonic === 'TONBip39'}
                                    onChange={() => {
                                        setUserMnemonic('TONBip39')
                                    }}
                                >
                                    TON Bip39
                                </RadioButton>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.userMnemonic}>
                            <div className={styles.label}>
                                Your seed phrase from:
                            </div>
                            <div className={styles.radio}>
                                <RadioButton
                                    labelPosition="after"
                                    value="test"
                                    checked={userMnemonic === 'SparXWallet'}
                                    onChange={() => {
                                        setUserMnemonic('SparXWallet')
                                    }}
                                >
                                    SparX wallet
                                </RadioButton>
                                <RadioButton
                                    labelPosition="after"
                                    value="test"
                                    checked={userMnemonic === 'TONTypesWallet'}
                                    onChange={() => {
                                        setUserMnemonic('TONTypesWallet')
                                    }}
                                >
                                    TON types wallet
                                </RadioButton>
                            </div>
                        </div>
                    )
                )}

                <FooterAction>
                    <Button
                        design="accent" form="words" type="submit"
                        disabled={!form.formState.isValid}
                    >
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
