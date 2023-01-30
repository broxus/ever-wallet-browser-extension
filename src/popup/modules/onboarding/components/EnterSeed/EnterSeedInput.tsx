import classNames from 'classnames'
import { memo, useCallback, useMemo, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Autocomplete, DatasetItem } from '@app/popup/modules/shared'

interface Props {
    name: string;
    index: number;
    getBip39Hints: (word: string) => string[];
    required: boolean;
}

export const EnterSeedInput = memo(({ name, index, required, getBip39Hints }: Props): JSX.Element => {
    const { control, setValue } = useFormContext()
    const [dataset, setDataset] = useState<DatasetItem[]>([])

    const validator = useMemo(() => {
        const all = new Set(getBip39Hints(''))
        return (value: string) => !value || all.has(value)
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
        <Autocomplete dataset={dataset} onSearch={handleSearch} onSelect={handleSelect}>
            {autocomplete => (
                <Controller
                    defaultValue=""
                    name={name}
                    control={control}
                    rules={{
                        required,
                        validate: validator,
                    }}
                    render={({ field, fieldState }) => (
                        <input
                            type="text"
                            className={classNames('inputs-list-item__input', {
                                error: fieldState.error,
                            })}
                            autoComplete="off"
                            spellCheck={false}
                            id={`seed-input-${index}`}
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
    )
})
