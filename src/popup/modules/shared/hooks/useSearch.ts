import React, { ChangeEvent, useEffect, useState, useTransition } from 'react'

export type SearchHook<T> = {
    props: {
        value: string,
        onChange: (e: ChangeEvent<HTMLInputElement>) => void
    },
    list: T[]
}

export function useSearch<T>(list: T[], filterFn: FilterFn<T>): SearchHook<T> {
    const [value, setValue] = useState('')
    const [filteredList, setFilteredList] = useState(list)
    const [, startTransition] = useTransition()

    const onChange = React.useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
        [setValue],
    )

    useEffect(() => {
        startTransition(() => {
            setFilteredList(() => {
                const search = value.trim().toLowerCase()
                return search ? filterFn(list, search) : list
            })
        })
    }, [list, value])

    return React.useMemo(() => ({
        props: { value, onChange },
        list: filteredList,
    }), [filteredList, value, onChange])
}

interface FilterFn<T> {
    (list: T[], search: string): T[];
}
