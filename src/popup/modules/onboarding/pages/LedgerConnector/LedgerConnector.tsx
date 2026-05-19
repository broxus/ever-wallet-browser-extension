import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { LedgerConnector as LedgerConnectorInner } from '@app/popup/modules/ledger';
import { useViewModel } from '@app/popup/modules/shared';

import { appRoutes } from '../../appRoutes';
import s from './LedgerConnector.module.scss';
import { LedgerConnectorViewModel } from './LedgerConnectorViewModel';

export const LedgerConnector = observer(() => {
    const vm = useViewModel(LedgerConnectorViewModel);
    const navigate = useNavigate();

    const handleNext = useCallback(async () => {
        await vm.save();
        navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.confirmation.path}`);
    }, []);

    const handleBack = useCallback(() => {
        navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.selectNetwork.path}`);
    }, []);

    return (
        <LedgerConnectorInner
            theme="sign-in"
            className={s.ledgerConnector}
            loading={vm.loading}
            onNext={handleNext}
            onBack={handleBack}
        />
    );
});
