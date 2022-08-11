import {
    memo, useCallback, useMemo, useState,
} from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { Autocomplete, DatasetItem, Input } from '@app/popup/modules/shared'

interface Props {
    name: string;
    index: number;
    getBip39Hints: (word: string) => string[];
}

export const ImportSeedInput = memo(({ name, index, getBip39Hints }: Props): JSX.Element => {
    const intl = useIntl()
    const { control, setValue } = useFormContext()
    const [dataset, setDataset] = useState<DatasetItem[]>([])

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

    const handleSelect = (item: DatasetItem) => {
        setValue(name, item.id)

        try {
            const nextToFocus = document.getElementById(`seed-input-${index + 1}`)

            setTimeout(() => nextToFocus?.focus())
        }
        catch (e: any) {
            console.error(e)
        }
    }

    return (
        <div className="accounts-management__seed-input">
            <Autocomplete dataset={dataset} onSearch={handleSearch} onSelect={handleSelect}>
                {autocomplete => (
                    <Controller
                        defaultValue=""
                        name={name}
                        control={control}
                        rules={{
                            required: true,
                            validate: validator,
                        }}
                        render={({ field }) => (
                            <Input
                                id={`seed-input-${index}`}
                                placeholder={intl.formatMessage({ id: 'WORD_FIELD_PLACEHOLDER' })}
                                name={field.name}
                                value={field.value}
                                ref={instance => {
                                    autocomplete.ref.current = instance
                                    field.ref(instance)
                                }}
                                onBlur={e => {
                                    autocomplete.onBlur(e)
                                    field.onBlur()
                                }}
                                onChange={e => {
                                    autocomplete.onChange(e)
                                    field.onChange(e)
                                }}
                                onKeyDown={autocomplete.onKeyDown}
                                onFocus={autocomplete.onFocus}
                            />
                        )}
                    />
                )}
            </Autocomplete>
        </div>
    )
})
