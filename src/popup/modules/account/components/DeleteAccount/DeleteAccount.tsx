import { observer } from 'mobx-react-lite';
import { useIntl } from 'react-intl';

import {
    Button,
    Card,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Navbar,
    Space,
    useViewModel,
} from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction';
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon';
import { Page } from '@app/popup/modules/shared/components/Page';
import { usePage } from '@app/popup/modules/shared/hooks/usePage';
import { useNavigate } from 'react-router';

import { DeleteAccountViewModel } from './DeleteAccountViewModel';
import styles from './DeleteAccount.module.scss';

export const DeleteAccount = observer(() => {
    const vm = useViewModel(DeleteAccountViewModel);
    const intl = useIntl();
    const page = usePage();
    const navigate = useNavigate();

    return (
        <Page animated page={page} id="delete-account-page">
            <Container>
                <Header>
                    <Navbar back={page.close(() => navigate(-1))}>
                        {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                    </Navbar>
                </Header>

                <Content className={styles.content}>
                    <Space direction="column" gap="l">
                        <div className={styles.text}>
                            {intl.formatMessage({ id: 'REMOVE_ACCOUNT_CONFIRMATION_TEXT' })}
                        </div>

                        <div className={styles.title}>{intl.formatMessage({ id: 'DELETE_ACCOUNT_HEADING' })}</div>

                        {vm.account && (
                            <Card size="xs" bg="layer-1" className={styles.card}>
                                <div className={styles.item}>
                                    <Jdenticon value={vm.account.tonWallet.address} variant="s" size={28} />
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemName} title={vm.account.name}>
                                            {vm.account.name}
                                        </div>
                                        <div className={styles.itemInfo} title={vm.account.tonWallet.address}>
                                            {convertAddress(vm.account.tonWallet.address)}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </Space>

                    <ErrorMessage>{vm.error}</ErrorMessage>
                </Content>

                <Footer layer>
                    <FooterAction>
                        <Button design="destructive" loading={vm.loading} onClick={vm.deleteAccount}>
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </Page>
    );
});
