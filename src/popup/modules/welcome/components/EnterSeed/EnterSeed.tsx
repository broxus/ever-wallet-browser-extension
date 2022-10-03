import {
    memo,
    useCallback,
    useMemo,
    useState,
} from 'react'
import { useIntl } from 'react-intl'
import type nt from '@wallet/nekoton-wasm'

import {
    Autocomplete,
    Button,
    DatasetItem,
    Select,
    TagInput,
} from '@app/popup/modules/shared'

import './EnterSeed.scss'

interface Props {
    disabled: boolean;
    getBip39Hints: (word: string) => string[];
    onSubmit: (words: string[], mnemonicType: nt.MnemonicType) => void;
    onBack: () => void;
}

const makeMnemonicType = (mnemonicType: nt.MnemonicType['type']): nt.MnemonicType =>
    (mnemonicType === 'labs' ? { type: 'labs', accountId: 0 } : { type: 'legacy' }) // eslint-disable-line implicit-arrow-linebreak

type OptionType = {
    value: nt.MnemonicType['type']
    label: string
}

const MNEMONIC_OPTIONS: OptionType[] = [
    {
        label: '12 word phrase',
        value: 'labs',
    },
    {
        label: 'Legacy 24 word phrase',
        value: 'legacy',
    },
]

export const EnterSeed = memo(({ disabled, getBip39Hints, onSubmit, onBack }: Props) => {
    const intl = useIntl()
    const [words, setWords] = useState<string[]>([])
    const [dataset, setDataset] = useState<DatasetItem[]>([])
    const [mnemonicType, setMnemonicType] = useState<nt.MnemonicType['type']>('labs')

    const validator = useMemo(() => {
        const all = new Set(getBip39Hints(''))
        return (value: string) => all.has(value)
    }, [])

    const handleSearch = useCallback((value: string) => {
        if (value) {
            const dataset: DatasetItem[] = getBip39Hints(value).map(word => ({
                id: word,
                label: word,
            }))

            setDataset(dataset)
        }
        else {
            setDataset([])
        }
    }, [])

    const handleSelect = useCallback((item: DatasetItem) => setWords(
        words => [...words, item.id],
    ), [])

    const handleMnemonicTypeChange = useCallback((value: nt.MnemonicType['type']) => {
        setMnemonicType(value)
        setWords((words) => words.slice(0, mnemonicType === 'labs' ? 12 : 24))
    }, [])

    const wordCount = mnemonicType === 'labs' ? 12 : 24

    return (
        <div className="enter-seed">
            <div className="enter-seed__form">
                <h2 className="enter-seed__title">
                    {intl.formatMessage({ id: 'ENTER_SEED_PHRASE' })}
                </h2>
                <Select<nt.MnemonicType['type']>
                    options={MNEMONIC_OPTIONS}
                    value={mnemonicType}
                    onChange={handleMnemonicTypeChange}
                    className="noselect"
                    disabled={disabled}
                />
                <Autocomplete
                    className="enter-seed__autocomplete"
                    dataset={dataset}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                >
                    {({ onChange, ...props }) => (
                        <TagInput
                            {...props}
                            validator={validator}
                            value={words}
                            maxCount={wordCount}
                            onChange={setWords}
                            onInputChange={onChange}
                        />
                    )}
                </Autocomplete>
                <div className="enter-seed__words-count">
                    {intl.formatMessage(
                        { id: 'ENTER_SEED_PHRASE_WORDS_COUNTER' },
                        {
                            value: words.length,
                            limit: wordCount,
                        },
                    )}
                </div>
            </div>
            <div className="enter-seed__buttons">
                <Button
                    disabled={disabled || words.length !== wordCount}
                    onClick={() => onSubmit(words, makeMnemonicType(mnemonicType))}
                >
                    {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                </Button>
                <Button design="secondary" onClick={onBack}>
                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                </Button>
            </div>
        </div>
    )
})
