import type nt from '@broxus/ever-wallet-wasm'
import { ClipboardEventHandler, memo, useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'
import classNames from 'classnames'

import MainBG from '@app/popup/assets/img/welcome/main-img-min.png'

import { EnterSeedInput } from './EnterSeedInput'

interface Props {
    disabled: boolean;
    error?: string;
    getBip39Hints: (word: string) => string[];
    onSubmit: (words: string[], mnemonicType: nt.MnemonicType) => void;
    onBack: () => void;
}

const makeMnemonicType = (mnemonicType: nt.MnemonicType['type']): nt.MnemonicType =>
    (mnemonicType === 'labs' ? { type: 'labs', accountId: 0 } : { type: 'legacy' }) // eslint-disable-line implicit-arrow-linebreak

const numbers = new Array(24).fill(0).map((_, i) => i)

export const EnterSeed = memo(({ disabled, getBip39Hints, error, onSubmit, onBack }: Props) => {
    const intl = useIntl()
    const form = useForm({ mode: 'all' })
    const [mnemonicType, setMnemonicType] = useState<nt.MnemonicType['type']>('labs')
    const wordCount = mnemonicType === 'labs' ? 12 : 24

    const submit = useCallback(
        (data: Record<string, string>) => {
            const words = Object.values(data).slice(0, mnemonicType === 'labs' ? 12 : 24)
            onSubmit(words, makeMnemonicType(mnemonicType))
        },
        [mnemonicType, onSubmit],
    )

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = useCallback(event => {
        try {
            const seedPhrase = event.clipboardData.getData('text/plain')
            const words = seedPhrase
                .replace(/\r\n|\r|\n/g, ' ')
                .replace(/\s\s+/g, ' ')
                .split(' ')
                .slice(0, wordCount)

            if (words.length > 0 && words.length <= wordCount) {
                setTimeout(() => {
                    words.forEach((word, idx) => {
                        form.setValue(`word${idx}`, word, {
                            shouldValidate: true,
                        })
                    })
                }, 0)
            }
        }
        catch (e: any) {
            console.log(e.message)
        }
    }, [wordCount])

    return (
        <div className={`slide slide--seed-list slide--seed--list-${wordCount}`}>
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <h2 className="sec-title">
                            {intl.formatMessage({ id: 'ENTER_SEED_PHRASE' })}
                        </h2>
                        <div className="wp-tabs">
                            <div className="wp-tabs__nav">
                                <button
                                    className={classNames('btn tab js-tab', { active: mnemonicType === 'labs' })}
                                    onClick={() => setMnemonicType('labs')}
                                >
                                    {intl.formatMessage({ id: '12_WORDS' })}
                                </button>
                                <button
                                    className={classNames('btn tab js-tab', { active: mnemonicType === 'legacy' })}
                                    onClick={() => setMnemonicType('legacy')}
                                >
                                    {intl.formatMessage({ id: '24_WORDS' })}
                                </button>
                            </div>
                            <div className="wp-tabs__items">
                                <div className="wp-tabs__item">
                                    <FormProvider {...form}>
                                        <form
                                            id="enter-seed"
                                            onSubmit={form.handleSubmit(submit)}
                                            onPaste={onPaste}
                                        >
                                            <ol className="inputs-list">
                                                {numbers.map((number) => (
                                                    <li className="inputs-list-item" key={number}>
                                                        <div className="inputs-list-item__wrap">
                                                            <EnterSeedInput
                                                                index={number}
                                                                name={`word${number}`}
                                                                required={number < 12 || mnemonicType === 'legacy'}
                                                                getBip39Hints={getBip39Hints}
                                                            />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        </form>
                                    </FormProvider>
                                </div>
                            </div>
                            {error && (
                                <div className="wp-tabs__error">{error}</div>
                            )}
                        </div>
                        <div className="sec-bar">
                            <button
                                type="button"
                                className="btn btn--secondary btn--half"
                                disabled={disabled}
                                onClick={onBack}
                            >
                                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                            </button>
                            <button
                                type="submit"
                                form="enter-seed"
                                className="btn btn--primery btn--half"
                                disabled={disabled}
                            >
                                {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                            </button>
                        </div>
                    </div>
                    <div className="slide__pic slide__animate">
                        <img src={MainBG} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
})
