import { ChangeEvent, useEffect, useState, useTransition } from 'react'

export function useSearch<T>(list: T[], filterFn: FilterFn<T>) {
    const [value, setValue] = useState('')
    const [filteredList, setFilteredList] = useState(list)
    const [, startTransition] = useTransition()

    const onChange = (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

    useEffect(() => {
        startTransition(() => {
            setFilteredList(() => {
                const search = value.trim().toLowerCase()
                return search ? filterFn(list, search) : list
            })
        })
    }, [list, value])

    return {
        props: { value, onChange },
        list: filteredList,
    }
}

interface FilterFn<T> {
    (list: T[], search: string): T[];
}
