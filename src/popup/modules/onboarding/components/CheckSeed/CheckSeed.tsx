/* eslint-disable react/no-array-index-key,no-nested-ternary,max-len */
import { memo, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { shuffleArray } from '@app/shared'

interface Props {
    seed: string;
    getBip39Hints: (word: string) => string[];
    onSubmit: () => void;
    onBack: () => void;
}

const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(0).map((_, i) => i))
    .slice(0, 3)
    .sort((a, b) => a - b) as [number, number, number]

export const CheckSeed = memo(({ seed, getBip39Hints, onSubmit, onBack }: Props) => {
    const [nonce, setNonce] = useState(0)
    const intl = useIntl()
    const { register, formState, watch, reset } = useForm({ mode: 'onChange' })

    const words = useMemo(() => seed.split(' '), [seed])
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

    const validateWord = (word: string, position: number) => words?.[position] === word

    useEffect(() => {
        if (Object.keys(formState.errors).length === 0) return

        const wrapper = document.getElementById('js-seeds-wrapper')!

        wrapper.classList.add('blocked')
        setTimeout(() => {
            wrapper.classList.add('hide')
        }, 600)
        setTimeout(() => {
            wrapper.classList.remove('hide')
            wrapper.classList.add('show')
            reset()
            setNonce((i) => i + 1)
        }, 800)
        setTimeout(() => {
            wrapper.classList.remove('show')
            wrapper.classList.remove('blocked')
        }, 1400)
    }, [Object.keys(formState.errors).length])

    return (
        <div className="slide slide--check active">
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <h2 className="sec-title">
                            {intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE' })}
                        </h2>
                        <p className="main-txt">
                            {intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE_NOTE' })}
                        </p>
                        <div className="sec-bar">
                            <button className="btn btn--secondary btn--half" onClick={onBack}>
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </button>
                            <button className="btn btn--primery btn--half" disabled={!formState.isValid} onClick={onSubmit}>
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </button>
                            <button className="btn btn--skip" onClick={onSubmit}>
                                {intl.formatMessage({ id: 'SKIP_BTN_TEXT' })}
                            </button>
                        </div>
                    </div>

                    <div className="slide__frame slide__animate">
                        <h2 className="slide__frame-title">
                            {intl.formatMessage({ id: 'YOUR_SEED_PHRASE' })}
                        </h2>
                        <div className="slide__frame-main">
                            <div className="seed-pharses" id="js-seeds-wrapper">
                                {rows.map((row, i) => (
                                    <div className="seed-pharse" key={i}>
                                        <h3 className="seed-pharse__name">
                                            {intl.formatMessage(
                                                { id: 'SELECT_WORD_FROM_SEED' },
                                                { position: positions[i] + 1 },
                                            )}
                                        </h3>
                                        <div className="seed-pharse__row">
                                            {row.map((word, j) => (
                                                <label
                                                    key={`${nonce}_${j}`}
                                                    className={classNames('seed-pharse-item', watch(`word${i}`) === word ? (
                                                        formState.errors[`word${i}`] ? '_invalid' : '_valid'
                                                    ) : null)}
                                                >
                                                    <input
                                                        type="radio"
                                                        value={word}
                                                        {...register(`word${i}`, {
                                                            required: true,
                                                            validate: (word: string) => validateWord(word, positions[i]),
                                                        })}
                                                    />
                                                    <span className="seed-pharse-item__cust">{word}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
