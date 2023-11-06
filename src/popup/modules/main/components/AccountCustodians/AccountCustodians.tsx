import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertPublicKey } from '@app/shared'
import { Card, Container, Content, IconButton, useViewModel } from '@app/popup/modules/shared'
import { RenameCustodian } from '@app/popup/modules/account'

import { AccountCustodiansViewModel } from './AccountCustodiansViewModel'
import styles from './AccountCustodians.module.scss'

interface Props {
    address: string;
}

export const AccountCustodians = observer(({ address }: Props): JSX.Element | null => {
    const vm = useViewModel(AccountCustodiansViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()

    const handleRenameCustodian = (publicKey: string) => vm.panel.open({
        render: () => <RenameCustodian publicKey={publicKey} />,
    })

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ACCOUNT_CUSTODIANS_TITLE' })}</h2>
                <p className={styles.desc}>
                    <FormattedMessage
                        id="ACCOUNT_CUSTODIANS_DESC"
                        values={{
                            b: (...parts) => <b>{parts}</b>,
                            required: vm.details?.requiredConfirmations ?? 0,
                            count: vm.custodians.length,
                        }}
                    />
                </p>

                <Card className={styles.card}>
                    {vm.custodians.map((publicKey) => (
                        <div key={publicKey} className={styles.item}>
                            <div className={styles.wrap}>
                                <div className={styles.name}>
                                    {vm.contacts[publicKey]?.name ?? convertPublicKey(publicKey)}
                                </div>
                                <div className={styles.key}>
                                    {convertPublicKey(publicKey)}
                                </div>
                            </div>
                            <IconButton
                                design="ghost"
                                size="s"
                                icon={Icons.edit}
                                className={styles.rename}
                                onClick={() => handleRenameCustodian(publicKey)}
                            />
                        </div>
                    ))}
                </Card>
            </Content>

            {/* <Footer>
                <Button
                    size="m"
                    design="secondary"
                    className={styles.btn}
                    onClick={() => {}}
                >
                    {intl.formatMessage({ id: 'Edit custodians' })}
                </Button>
            </Footer> */}
        </Container>
    )
})
