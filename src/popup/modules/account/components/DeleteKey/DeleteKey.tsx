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
    Icon,
    Navbar,
    Space,
    useViewModel,
} from '@app/popup/modules/shared';
import { convertAddress } from '@app/shared';
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction';

import { DeleteKeyViewModel } from './DeleteKeyViewModel';
import styles from './DeleteKey.module.scss';
import { Page } from '@app/popup/modules/shared/components/Page';
import { usePage } from '@app/popup/modules/shared/hooks/usePage';
import { useNavigate } from 'react-router';

export const DeleteKey = observer(() => {
    const vm = useViewModel(DeleteKeyViewModel);
    const intl = useIntl();
    const page = usePage();
    const navigate = useNavigate();

    return (
        <Page animated page={page} id="delete-key-page">
            <Container className={styles.container}>
                <Header className={styles.header}>
                    <Navbar back={page.close(() => navigate(-1))}>
                        {intl.formatMessage({ id: 'DELETE_KEY_HEADER' })}
                    </Navbar>
                </Header>

                <Content className={styles.content}>
                    <Space direction="column" gap="l">
                        <Space direction="column" gap="l">
                            <div className={styles.text}>{intl.formatMessage({ id: 'DELETE_KEY_MESSAGE' })}</div>

                            <div className={styles.title}>{intl.formatMessage({ id: 'DELETE_KEY_LIST_HEADING' })}</div>

                            <Card size="xs" bg="layer-1" className={styles.card}>
                                <div className={styles.item}>
                                    <Icon icon="keyRound" width={20} height={20} />
                                    <div className={styles.itemContent}>
                                        <div className={styles.itemName} title={vm.name}>
                                            {vm.name}
                                        </div>
                                        <div className={styles.itemInfo}>
                                            {intl.formatMessage(
                                                { id: 'ACCOUNTS_PLURAL' },
                                                { count: vm.accountsByPublicKey[vm.keyEntry.publicKey] ?? 0 },
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Space>

                        <Space direction="column" gap="m">
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'DELETE_KEY_LIST_ACCOUNTS_HEADING' })}
                            </div>

                            <Card size="xs" bg="layer-1" className={styles.card}>
                                {vm.accounts.map((account) => (
                                    <div key={account.tonWallet.address} className={styles.item}>
                                        <Icon icon="user" width={20} height={20} />
                                        <div className={styles.itemContent}>
                                            <div className={styles.itemName} title={account.name}>
                                                {account.name}
                                            </div>
                                            <div className={styles.itemInfo} title={account.tonWallet.address}>
                                                {convertAddress(account.tonWallet.address)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Card>
                        </Space>
                    </Space>

                    <ErrorMessage>{vm.error}</ErrorMessage>
                </Content>

                <Footer layer>
                    <FooterAction>
                        <Button design="destructive" loading={vm.loading} onClick={vm.deleteKey}>
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </Page>
    );
});
