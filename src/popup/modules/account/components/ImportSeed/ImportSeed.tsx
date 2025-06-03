import { ClipboardEventHandler, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Button, ConnectionStore, Container, Content, Footer, Form, Header, Navbar, NekotonToken, RadioButton, Space, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { isFirefox } from '@app/popup/modules/shared/utils/isFirefox'
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

    const [userMnemonic, setUserMnemonic] = useState<UserMnemonic>('TONTypesWallet')
    const isTonOrHamster = useMemo(() => selectedConnectionNetworkType === 'ton' || selectedConnectionNetworkType === 'hamster', [selectedConnectionNetworkType])

    const values = form.watch()
    const isValid = form.formState.isValid

    const numbers = useMemo(
        () => new Array(wordsCount).fill(1).map((_, i) => i + 1),
        [wordsCount],
    )

    const addSeedPhrase = (seedPhrase: string) => {
        try {
            const cleanedPhrase = seedPhrase
                .toLowerCase()
                .replace(/[^a-zA-Z]+/g, ' ')
                .trim()
                .replace(/\s+/g, ' ')

            const words = cleanedPhrase.split(' ').slice(0, wordsCount)

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
    }

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = (event) => {
        const seedPhrase = event.clipboardData.getData('text/plain')
        addSeedPhrase(seedPhrase)
    }

    const onFormInput = (event:React.ChangeEvent<HTMLFormElement>) => {
        if (!isFirefox) return
        addSeedPhrase(event.target.value)
    }


    const submit = useCallback((data: Record<string, string>) => {
        onSubmit(Object.values(data), isTonOrHamster ? userMnemonic : undefined)
    }, [onSubmit, userMnemonic])


    const isBip39 = useMemo(() => {
        if (!isValid || !isTonOrHamster) {
            return false
        }
        try {
            const words = Object.values(values).slice(0, wordsCount)
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
    }, [isTonOrHamster, values, isValid, wordsCount, nekoton])

    useEffect(() => {
        if (isTonOrHamster && wordsCount === 24) {
            setUserMnemonic(isBip39 ? 'TONBip39' : 'TONStandard')
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
                    <Form
                        id="words" onSubmit={form.handleSubmit(submit)} onPaste={onPaste}
                        onInput={onFormInput}
                    >
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
                {isTonOrHamster && (
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
