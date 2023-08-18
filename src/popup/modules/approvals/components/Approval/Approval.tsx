import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, PropsWithChildren } from 'react'
import { useIntl } from 'react-intl'

import { Container, PageLoader, ParamsPanel, UserInfo } from '@app/popup/modules/shared'

import styles from './Approval.module.scss'

type Props = PropsWithChildren<{
    origin: string;
    account: nt.AssetsList;
    className?: string;
    loading?: boolean;
}>;

export const Approval = memo(({ origin, account, className, loading, children }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container className={className}>
            <ParamsPanel className={styles.panel}>
                <ParamsPanel.Param>
                    <UserInfo account={account} />
                </ParamsPanel.Param>
                <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                    {origin}
                </ParamsPanel.Param>
            </ParamsPanel>
            {loading && <PageLoader />}
            {children}
        </Container>
    )
})
