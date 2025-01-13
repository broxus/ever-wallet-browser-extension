import { ClipboardEventHandler, useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { getBip39Hints } from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'

import { Button, Space, useResolve } from '@app/popup/modules/shared'

import s from './EnterSeed.module.scss'
import { NavigationBar } from '../../components/NavigationBar'
import { EnterSeedInput } from './EnterSeedInput'
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore'
import { appRoutes } from '../../appRoutes'

const makeMnemonicType = (mnemonicType: nt.MnemonicType['type']): nt.MnemonicType => (mnemonicType === 'labs' ? { type: 'labs', accountId: 0 } : { type: 'legacy' }) // eslint-disable-line implicit-arrow-linebreak

const numbers = new Array(24).fill(0).map((_, i) => i)

export const EnterSeed = observer(() => {
    const navigate = useNavigate()
    const intl = useIntl()
    const form = useForm({ mode: 'all' })
    const [mnemonicType, setMnemonicType] = useState<nt.MnemonicType['type']>('labs')
    const wordCount = mnemonicType === 'labs' ? 12 : 24
    const { submitSeed } = useResolve(ImportAccountStore)

    const submit = async (data: Record<string, string>) => {
        const words = Object.values(data).slice(0, mnemonicType === 'labs' ? 12 : 24)
        if (form.formState.isValid) {
            submitSeed(words, makeMnemonicType(mnemonicType))
            navigate(`${appRoutes.importAccount.path}/${appRoutes.createPassword.path}`)
        }
    }

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = useCallback(
        (event) => {
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
                                shouldDirty: true,
                                shouldTouch: true,
                            })
                        })
                    }, 0)
                }
            }
            catch (e: any) {
                // eslint-disable-next-line no-console
                console.error(e.message)
            }
        },
        [wordCount],
    )

    const handleCheckPhrase = () => {
        submit(form.getValues())
    }

    const handleBack = useCallback(() => {
        navigate(`${appRoutes.importAccount.path}/${appRoutes.selectNetwork.path}`)
    }, [])

    const handleChangeMnemonicType = (value: nt.MnemonicType['type']) => {
        setMnemonicType(value)
        form.reset()
    }

    return (
        <div className={classNames(s.container, wordCount === 12 ? s.enterSeed12 : s.enterSeed24)}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="l">
                        <h2 className={s.title}>{intl.formatMessage({ id: 'ENTER_SEED_PHRASE' })}</h2>
                        <p className={s.text} />
                    </Space>
                </div>
                <div>
                    <div className={s.tabs}>
                        <Space direction="row" gap="s">
                            <Button design={mnemonicType === 'labs' ? 'accent' : 'neutral'} onClick={() => handleChangeMnemonicType('labs')}>
                                {intl.formatMessage({ id: '12_WORDS' })}
                            </Button>
                            <Button design={mnemonicType === 'legacy' ? 'accent' : 'neutral'} onClick={() => handleChangeMnemonicType('legacy')}>
                                {intl.formatMessage({ id: '24_WORDS' })}
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <FormProvider {...form}>
                            <form id="enter-seed" onPaste={onPaste}>
                                <ol className={classNames(mnemonicType === 'legacy' ? s.list24 : s.list12)}>
                                    {numbers.map((number) => (
                                        <li className={s.item} key={number}>
                                            <EnterSeedInput
                                                prefix={number + 1} index={number} name={`word${number}`}
                                                required={number < 12 || mnemonicType === 'legacy'} getBip39Hints={getBip39Hints}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
            <NavigationBar onNext={handleCheckPhrase} onBack={handleBack} disabled={!form.formState.isValid} />
        </div>
    )
})
