import React, { ClipboardEventHandler, useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { getBip39Hints } from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'

import { Button, RadioButton, Space, useResolve } from '@app/popup/modules/shared'
import { UserMnemonic } from '@app/models'

import s from './EnterSeed.module.scss'
import { NavigationBar } from '../../components/NavigationBar'
import { EnterSeedInput } from './EnterSeedInput'
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore'
import { appRoutes } from '../../appRoutes'

const numbers = new Array(24).fill(0).map((_, i) => i)

const makeMnemonicType = (wordsCount: number, userMnemonic?: UserMnemonic): nt.MnemonicType => (
    (wordsCount === 12
        ? { type: 'bip39', data: { accountId: 0, path: 'ever', entropy: 'bits128' }}
        : userMnemonic === 'TONBip39'
            ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits256' }}
            : { type: 'legacy' }))

export const EnterSeed = observer(() => {
    const navigate = useNavigate()
    const intl = useIntl()
    const form = useForm({ mode: 'all' })
    const [wordsCount, setWordsCount] = useState(12)
    const [userMnemonic, setUserMnemonic] = useState<UserMnemonic>()

    const vm = useResolve(ImportAccountStore)
    const values = form.watch()
    const isValid = form.formState.isValid

    const isBip39 = React.useMemo(() => {
        const words = Object.values(values).slice(0, wordsCount)
        if (isValid) {
            try {
                vm.validateMnemonic(words, {
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
    }, [values, isValid, wordsCount])

    const submit = async (data: Record<string, string>) => {
        const words = Object.values(data).slice(0, wordsCount)
        if (form.formState.isValid) {
            vm.submitSeed(words, makeMnemonicType(wordsCount, userMnemonic), userMnemonic)
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
                    .slice(0, wordsCount)

                if (words.length > 0 && words.length <= wordsCount) {
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
        [wordsCount],
    )

    const handleCheckPhrase = () => {
        submit(form.getValues())
    }

    const handleBack = useCallback(() => {
        navigate(`${appRoutes.importAccount.path}/${appRoutes.selectNetwork.path}`)
    }, [])

    const handleChangeWordsCount = (value: number) => {
        setWordsCount(value)
        form.reset()
    }

    useEffect(() => {
        setUserMnemonic(wordsCount === 24 ? (isBip39 ? 'TONBip39' : 'TONStandard') : undefined)
    }, [isBip39, wordsCount])

    return (
        <div className={classNames(s.container, wordsCount === 12 ? s.enterSeed12 : s.enterSeed24)}>
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
                            <Button design={wordsCount === 12 ? 'accent' : 'neutral'} onClick={() => handleChangeWordsCount(12)}>
                                {intl.formatMessage({ id: '12_WORDS' })}
                            </Button>
                            <Button design={wordsCount === 24 ? 'accent' : 'neutral'} onClick={() => handleChangeWordsCount(24)}>
                                {intl.formatMessage({ id: '24_WORDS' })}
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <FormProvider {...form}>
                            <form id="enter-seed" onPaste={onPaste}>
                                <ol className={classNames(wordsCount === 24 ? s.list24 : s.list12)}>
                                    {numbers.map((number) => (
                                        <li className={s.item} key={number}>
                                            <EnterSeedInput
                                                prefix={number + 1} index={number} name={`word${number}`}
                                                required={number < 12 || wordsCount === 24}
                                                getBip39Hints={getBip39Hints}
                                            />
                                        </li>
                                    ))}
                                </ol>
                            </form>
                        </FormProvider>
                    </div>

                    {wordsCount === 24 && (
                        <div className={s.walletType}>
                            <RadioButton
                                labelPosition="before"
                                value="test"
                                checked={userMnemonic === 'TONStandard'}
                                onChange={() => {
                                    setUserMnemonic('TONStandard')
                                }}
                            >
                                TON Standard
                            </RadioButton>
                            <RadioButton
                                labelPosition="before"
                                value="test"
                                checked={userMnemonic === 'TONBip39'}
                                onChange={() => {
                                    setUserMnemonic('TONBip39')
                                }}
                            >
                                TON Bip39
                            </RadioButton>
                        </div>
                    )}
                </div>
            </div>
            <NavigationBar onNext={handleCheckPhrase} onBack={handleBack} disabled={!form.formState.isValid} />
        </div>
    )
})
