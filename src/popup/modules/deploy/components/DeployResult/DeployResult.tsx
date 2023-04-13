import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useMemo } from 'react'
import classNames from 'classnames'

import InProgressImg from '@app/popup/assets/img/in-progress.svg'
import { Button, Container, Content, Footer, useViewModel } from '@app/popup/modules/shared'

import { DeployResultViewModel } from './DeployResultViewModel'
import { CustodianContactForm } from './CustodianContactForm'

import './DeployResult.scss'

interface Props {
    custodians: string[];
    onClose(): void;
}

export const DeployResult = observer(({ custodians, onClose }: Props): JSX.Element => {
    const vm = useViewModel(DeployResultViewModel)
    const intl = useIntl()

    const newCustodians = useMemo(() => custodians.filter((key) => !vm.contacts[key]), [])

    return (
        <Container className="deploy-result">
            <Content className={classNames('deploy-result__content', { _offset: newCustodians.length === 0 })}>
                <img src={InProgressImg} alt="" />
                <h1 className="deploy-result__header">
                    {intl.formatMessage({ id: 'DEPLOY_MULTISIG_RESULT_HEADER' })}
                </h1>

                {newCustodians.length !== 0 && (
                    <>
                        <div className="deploy-result__text">
                            {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_TEXT' })}
                        </div>

                        <div className="deploy-result__panel">
                            {newCustodians.map((custodian) => (
                                <CustodianContactForm publicKey={custodian} onSubmit={vm.submit} />
                            ))}
                        </div>
                    </>
                )}
            </Content>

            <Footer>
                <Button onClick={onClose}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
