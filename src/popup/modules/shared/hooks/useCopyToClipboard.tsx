import copy from 'copy-to-clipboard'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'

import { NotificationStore } from '../store'
import { useResolve } from './useResolve'

export function useCopyToClipboard(): (value: string) => void {
    const notification = useResolve(NotificationStore)
    const intl = useIntl()

    return useCallback((value: string) => {
        copy(value)
        notification.show({
            type: 'success',
            message: (
                <>
                    {Icons.snackSuccess}
                    {intl.formatMessage({ id: 'COPIED_TOOLTIP' })}
                </>
            ),
        })
    }, [])
}
