import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Loader, Navbar } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'

// import { DeployResultViewModel } from './DeployResultViewModel'
// import { CustodianContactForm } from './CustodianContactForm'
import styles from './DeployResult.module.scss'

export const DeployResult = observer((): JSX.Element => {
    // const vm = useViewModel(DeployResultViewModel)
    const intl = useIntl()

    // const newCustodians = useMemo(() => vm.custodians.filter((key) => !vm.contacts[key]), [])

    return (
        <Container>
            <Header>
                <Navbar close="window" />
            </Header>

            <Content className={styles.content}>
                <Loader className={styles.loader} />
                <p>{intl.formatMessage({ id: 'DEPLOY_MULTISIG_RESULT_HEADER' })}</p>
            </Content>

            <Footer>
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})

// <Content className={classNames('deploy-result__content', { _offset: newCustodians.length === 0 })}>
//                 <img src={InProgressImg} alt="" />
//                 <h1 className="deploy-result__header">
//                     {intl.formatMessage({ id: 'DEPLOY_MULTISIG_RESULT_HEADER' })}
//                 </h1>
//
//                 {newCustodians.length !== 0 && (
//                     <>
//                         <div className="deploy-result__text">
//                             {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_TEXT' })}
//                         </div>
//
//                         <div className="deploy-result__panel">
//                             {newCustodians.map((custodian) => (
//                                 <CustodianContactForm publicKey={custodian} onSubmit={vm.submit} />
//                             ))}
//                         </div>
//                     </>
//                 )}
//             </Content>
