import { useEffect, useState } from 'react'

export const useAsyncData = <T>(asyncData: Promise<T> | undefined | null): T | undefined => {
    const [data, setData] = useState<T>()

    useEffect(() => {
        const ref = { canceled: false }

        asyncData?.then((data) => {
            if (!ref.canceled) {
                setData(data)
            }
        })

        return () => {
            ref.canceled = true
        }
    }, [asyncData])

    return data
}
