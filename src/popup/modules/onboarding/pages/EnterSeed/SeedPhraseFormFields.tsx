import React, { type ClipboardEventHandler } from 'react'
import classNames from 'classnames'
import { getBip39Hints } from '@broxus/ever-wallet-wasm'

import { EnterSeedInput } from './EnterSeedInput'
import s from './EnterSeed.module.scss'

const numbers = new Array(24).fill(0).map((_, i) => i)

interface SeedPhraseFormFieldsProps {
    wordsCount: number
    onPaste: ClipboardEventHandler<HTMLFormElement>
    onFormInput: (event: React.ChangeEvent<HTMLFormElement>) => void
}

export const SeedPhraseFormFields: React.FC<SeedPhraseFormFieldsProps> = ({
    wordsCount,
    onPaste,
    onFormInput,
}) => (
    <form id="enter-seed" onPaste={onPaste} onInput={onFormInput as React.FormEventHandler<HTMLFormElement>}>
        <ol className={classNames(wordsCount === 24 ? s.list24 : s.list12)}>
            {numbers.map((number) => (
                <li className={s.item} key={number}>
                    <EnterSeedInput
                        prefix={number + 1}
                        index={number}
                        name={`word${number}`}
                        required={number < 12 || wordsCount === 24}
                        getBip39Hints={getBip39Hints}
                    />
                </li>
            ))}
        </ol>
    </form>
)
