/* eslint-disable react/no-array-index-key */
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { shuffleArray } from '@app/shared'
import { Button, Container, Content, Footer, Form, Header, Navbar, NotificationStore, Space, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './CheckNewSeedPhrase.module.scss'

interface Props {
    words: string[];
    getBip39Hints(word: string): Array<string>;
    onSubmit(): void;
    onBack(): void;
}

const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(0).map((_, i) => i))
    .slice(0, 3)
    .sort((a, b) => a - b)

export const CheckNewSeedPhrase = observer(({ words, getBip39Hints, onSubmit, onBack }: Props) => {
    const [nonce, setNonce] = useState(0)
    const notification = useResolve(NotificationStore)
    const intl = useIntl()
    const { handleSubmit, formState, control, reset } = useForm({ mode: 'onChange' })
    const { word0, word1, word2 } = formState.errors

    const positions = useMemo(() => generateRandomNumbers(words.length), [words, nonce]) // <-- generate new positions
    const rows = useMemo(() => {
        const hints = shuffleArray(getBip39Hints(''))
        const [first, second, third] = positions
        return [
            shuffleArray(hints.slice(0, 2).concat(words[first])),
            shuffleArray(hints.slice(2, 4).concat(words[second])),
            shuffleArray(hints.slice(4, 6).concat(words[third])),
        ]
    }, [positions])

    useEffect(() => {
        if (word0 || word1 || word2) {
            notification.error(intl.formatMessage({ id: 'THE_SEED_WRONG' }))

            setTimeout(() => {
                setNonce((value) => value + 1)
                reset()
            }, 1000)
        }
    }, [word0, word1, word2])

    return (
        <Container>
            <Header>
                <Navbar back={onBack}>
                    {intl.formatMessage({ id: 'CHECK_SEED_TITLE' })}
                </Navbar>
            </Header>

            <Content>
                <div className={styles.desc}>{intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE_TITLE' })}</div>

                <Form id="words" onSubmit={handleSubmit(onSubmit)}>
                    {rows.map((row, i) => (
                        <div key={i}>
                            <div className={styles.label}>
                                {intl.formatMessage(
                                    { id: 'SELECT_WORD_FROM_SEED' },
                                    { position: positions[i] + 1 },
                                )}
                            </div>
                            <Space direction="row" gap="s">
                                {row.map((word, j) => (
                                    <Controller
                                        key={`${nonce}_${j}`}
                                        name={`word${i}`}
                                        control={control}
                                        rules={{
                                            required: true,
                                            validate: (value) => value === words[positions[i]],
                                        }}
                                        render={({ field, fieldState }) => (
                                            <label
                                                className={classNames(styles.item, {
                                                    [styles._invalid]: fieldState.invalid && field.value === word,
                                                    [styles._valid]: !fieldState.invalid && field.value === word,
                                                })}
                                            >
                                                {word}
                                                <input
                                                    {...field}
                                                    type="radio"
                                                    className={styles.radio}
                                                    disabled={!!field.value}
                                                    value={word}
                                                />
                                            </label>
                                        )}
                                    />
                                ))}
                            </Space>
                        </div>
                    ))}
                </Form>
            </Content>

            <Footer layer>
                <FooterAction dir="column">
                    <Button
                        design="accent" type="submit" form="words"
                        disabled={!formState.isValid}
                    >
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                    <Button design="neutral" onClick={onSubmit}>
                        {intl.formatMessage({ id: 'CREATE_SEED_SKIP_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
