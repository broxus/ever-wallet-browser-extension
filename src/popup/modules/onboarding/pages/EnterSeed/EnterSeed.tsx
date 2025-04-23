import React, { ClipboardEventHandler, useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { useNavigate } from 'react-router'
import { FormProvider, useForm } from 'react-hook-form'
import { getBip39Hints } from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'

import { Button, ErrorMessage, RadioButton, Space, useResolve, useViewModel } from '@app/popup/modules/shared'
import { UserMnemonic } from '@app/models'
import { NetworksViewModel } from '@app/popup/modules/network/components/Networks/NetworksViewModel'
import { isFirefox } from '@app/popup/modules/shared/utils/isFirefox'

import s from './EnterSeed.module.scss'
import { NavigationBar } from '../../components/NavigationBar'
import { EnterSeedInput } from './EnterSeedInput'
import { ImportAccountStore } from '../../modules/ImportAccount/ImportAccountStore'
import { appRoutes } from '../../appRoutes'

const numbers = new Array(24).fill(0).map((_, i) => i)

const makeMnemonicType = (wordsCount: number, userMnemonic?: UserMnemonic): nt.MnemonicType => (
    (wordsCount === 12
        ? userMnemonic === 'TONTypesWallet'
            ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits128' }}
            : { type: 'bip39', data: { accountId: 0, path: 'ever', entropy: 'bits128' }}
        : userMnemonic === 'TONBip39'
            ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits256' }}
            : { type: 'legacy' }))

export const EnterSeed = observer(() => {
    const network = useViewModel(NetworksViewModel)
    const navigate = useNavigate()
    const intl = useIntl()
    const form = useForm({ mode: 'all' })
    const [wordsCount, setWordsCount] = useState(12)
    const [userMnemonic, setUserMnemonic] = useState<UserMnemonic>('TONTypesWallet')
    const [error, setError] = useState<string>()

    const vm = useResolve(ImportAccountStore)
    const isTonOrHamster = useMemo(() => vm.networkType === 'ton' || vm.networkType === 'hamster', [vm.networkType])
    const values = form.watch()

    const isValid = form.formState.isValid

    const isBip39 = React.useMemo(() => {
        if (!isTonOrHamster && !isValid) {
            return false
        }
        try {
            const words = Object.values(values).slice(0, wordsCount)
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
    }, [isTonOrHamster, values, isValid, wordsCount])

    const isVenom = React.useMemo(() => network.selectedConnection.network === 'venom', [network.selectedConnection.network])

    const submit = async (data: Record<string, string>) => {
        try {
            if (form.formState.isValid) {
                const words = Object.values(data).slice(0, wordsCount)
                vm.submitSeed(
                    words,
                    makeMnemonicType(wordsCount, userMnemonic),
                    isTonOrHamster ? userMnemonic : undefined,
                )
                navigate(`${appRoutes.importAccount.path}/${appRoutes.createPassword.path}`)
            }
        }
        catch (e) {
            console.warn(e)
            setError(intl.formatMessage({
                id: 'THE_SEED_WRONG',
            }))
        }
    }

    const addSeedPhrase = (seedPhrase:string) => {
        try {
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
    }

    const onPaste: ClipboardEventHandler<HTMLFormElement | HTMLInputElement> = (event) => {
        const seedPhrase = event.clipboardData.getData('text/plain')
        addSeedPhrase(seedPhrase)
    }

    const onFormInput = (event:React.ChangeEvent<HTMLFormElement>) => {
        if (!isFirefox) return
        addSeedPhrase(event.target.value)
    }

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
        if (isTonOrHamster && wordsCount === 24) {
            setUserMnemonic(isBip39 ? 'TONBip39' : 'TONStandard')
        }
    }, [isBip39, wordsCount, isTonOrHamster])

    useEffect(() => {
        setError(undefined)
        if (wordsCount === 12) {
            setUserMnemonic('TONTypesWallet')
        }
        else if (wordsCount === 24) {
            setUserMnemonic('TONStandard')
        }
    }, [wordsCount])

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
                    {
                        !isVenom
                        && (
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
                        )
                    }
                    <div>
                        <FormProvider {...form}>
                            <form id="enter-seed" onPaste={onPaste} onInput={onFormInput}>
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

                    {(vm.networkType === 'ton' || vm.networkType === 'hamster') && (
                        wordsCount === 24 ? (
                            <div className={s.walletType}>
                                Seed phrase format:

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
                        ) : (
                            <div className={s.walletType}>
                                Your seed phrase from:

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
                        )
                    )}

                    <ErrorMessage className={s.errors}>
                        {error}
                    </ErrorMessage>
                </div>
            </div>
            <NavigationBar onNext={handleCheckPhrase} onBack={handleBack} disabled={!form.formState.isValid} />
        </div>
    )
})
