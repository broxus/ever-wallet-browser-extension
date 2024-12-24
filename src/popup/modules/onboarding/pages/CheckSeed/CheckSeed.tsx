/* eslint-disable react/no-array-index-key,no-nested-ternary,max-len */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { observer } from 'mobx-react-lite'

import { NekotonToken, NotificationStore, Space, useResolve } from '@app/popup/modules/shared'
import { shuffleArray } from '@app/shared'
import { Icons } from '@app/popup/icons'

import { NavigationBar } from '../../components/NavigationBar'
import s from './CheckSeed.module.scss'
import { generateRandomNumbers } from '../../utils/generateRandomNumbers'
import { NewAccountStore } from '../../modules/NewAccount/NewAccountStore'
import { appRoutes } from '../../appRoutes'

export const CheckSeed = observer((): JSX.Element => {
    const navigate = useNavigate()
    const { seed } = useResolve(NewAccountStore)
    const notification = useResolve(NotificationStore)
    const nekoton = useResolve(NekotonToken)

    const [nonce, setNonce] = useState(0)
    const intl = useIntl()
    const { register, formState, watch, reset, setValue } = useForm({ mode: 'onChange' })

    const words = useMemo(() => seed.phrase.split(' '), [seed])
    const positions = useMemo(() => generateRandomNumbers(words.length), [words, nonce]) // <-- generate new positions
    const rows = useMemo(() => {
        const hints = shuffleArray(nekoton.getBip39Hints(''))
        const [first, second, third] = positions
        return [
            shuffleArray(hints.slice(0, 2).concat(words[first])),
            shuffleArray(hints.slice(2, 4).concat(words[second])),
            shuffleArray(hints.slice(4, 6).concat(words[third])),
        ]
    }, [positions])

    const validateWord = (word: string, position: number) => words?.[position] === word

    useEffect(() => {
        if (Object.keys(formState.errors).length === 0) return
        notification.show({
            type: 'error',
            message: (
                <>
                    {intl.formatMessage({ id: 'THE_SEED_WRONG' })}
                </>
            ),
        })
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const wrapper = document.getElementById('js-seeds-wrapper')!

        wrapper.classList.add(s.blocked)
        setTimeout(() => {
            wrapper.classList.add(s.hide)
        }, 600)
        setTimeout(() => {
            wrapper.classList.remove(s.hide)
            wrapper.classList.add(s.show)
            reset()
            setNonce((i) => i + 1)
        }, 800)
        setTimeout(() => {
            wrapper.classList.remove(s.show)
            wrapper.classList.remove(s.blocked)
        }, 1400)
    }, [Object.keys(formState.errors).length])


    const handleCheckPhrase = useCallback(() => {
        if (formState.isValid) navigate(`${appRoutes.newAccount.path}/${appRoutes.createPassword.path}`)
    }, [formState.isValid])
    const handleEnterPassword = useCallback(() => {
        navigate(`${appRoutes.newAccount.path}/${appRoutes.createPassword.path}`)
    }, [])
    const handleBack = useCallback(() => {
        navigate(`${appRoutes.newAccount.path}/${appRoutes.saveSeed.path}`)
    }, [])


    return (
        <div className={s.container}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="m">
                        <h2 className={s.title}>
                            {intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE' })}
                        </h2>
                        <p className={s.text}>
                            {intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE_NOTE' })}
                        </p>
                    </Space>
                </div>

                <div>
                    <div id="js-seeds-wrapper">
                        {rows.map((row, i) => (
                            <div className={s.seedPhrase} key={i}>
                                <Space direction="column" gap="m">
                                    <h3 className={s.seedPhraseName}>
                                        {intl.formatMessage(
                                            { id: 'SELECT_WORD_FROM_SEED' },
                                            { position: positions[i] + 1 },
                                        )}
                                    </h3>
                                    <Space direction="row" gap="s" className={s.seedPhraseRow}>
                                        {row.map((word, j) => (
                                            <label
                                                key={`${nonce}_${j}`}
                                                className={s.seedPhraseItem}
                                            >
                                                <input
                                                    type="radio"
                                                    value={word}
                                                    {...register(
                                                        `word${i}`,
                                                        {
                                                            required: true,
                                                            validate: (word: string) => validateWord(word, positions[i]),
                                                        },
                                                    )}
                                                />
                                                <span
                                                    className={classNames(s.seedPhraseItemCust, watch(`word${i}`) === word ? (
                                                        formState.errors[`word${i}`] ? s.invalid : s.valid
                                                    ) : null)}
                                                >
                                                    {word}
                                                    <button
                                                        type="button"
                                                        className={classNames(s.btn, watch(`word${i}`) === word ? s.show : s.hide)}
                                                        onClick={() => {
                                                            setValue(`word${i}`, null)
                                                        }}
                                                    >
                                                        <i>{Icons.delete}</i>
                                                    </button>
                                                </span>
                                            </label>
                                        ))}
                                    </Space>
                                </Space>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <NavigationBar
                onNext={handleCheckPhrase}
                onSkip={handleEnterPassword}
                onBack={handleBack}
                disabled={!formState.isValid}
            />
        </div>
    )
})
