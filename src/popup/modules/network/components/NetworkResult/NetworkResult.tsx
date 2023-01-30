import { memo } from 'react'
import { useIntl } from 'react-intl'

import SuccessImg from '@app/popup/assets/img/success.svg'
import { Button, ButtonGroup, Container, Content, Footer } from '@app/popup/modules/shared'

import './NetworkResult.scss'

interface Props {
    type: 'add' | 'update';
    onClose(switchNetwork: boolean): void;
}

export const NetworkResult = memo(({ type, onClose }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container className="network-result">
            <Content className="network-result__content">
                <img src={SuccessImg} alt="" />
                <h1 className="network-result__header">
                    {type === 'add'
                        ? intl.formatMessage({ id: 'NETWORK_RESULT_ADD' })
                        : intl.formatMessage({ id: 'NETWORK_RESULT_UPDATE' })}
                </h1>
            </Content>

            <Footer>
                <ButtonGroup vertical>
                    <Button design="primary" onClick={() => onClose(true)}>
                        {intl.formatMessage({ id: 'NETWORK_RESULT_SWITCH_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={() => onClose(false)}>
                        {intl.formatMessage({ id: 'NETWORK_RESULT_CONTINUE_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
