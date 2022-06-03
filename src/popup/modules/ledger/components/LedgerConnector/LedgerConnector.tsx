import { Button, Notification, useResolve } from '@app/popup/modules/shared';
import { LEDGER_BRIDGE_URL } from '@app/shared';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { PanelLoader } from '../PanelLoader';
import { LedgerConnectorViewModel } from './LedgerConnectorViewModel';

import './LedgerConnector.scss';

interface Props {
  theme?: 'sign-in';
  onNext: () => void;
  onBack: () => void;
}

export const LedgerConnector = observer(({ onNext, onBack, theme }: Props) => {
  const vm = useResolve(LedgerConnectorViewModel);
  const intl = useIntl();
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = async (reply: any) => {
      const success = await vm.handleMessage(reply);

      if (success) {
        onNext?.();
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      {vm.error && (
        // TODO: intl?
        <Notification title="Could not connect your Ledger" onClose={vm.resetError}>
          {vm.error}
        </Notification>
      )}

      <div className={classNames('ledger-connector', theme)}>
        <div className="ledger-connector__content">
          {vm.loading && (
            <PanelLoader
              paddings={theme !== 'sign-in'}
              transparent={theme === 'sign-in'}
            />
          )}

          <iframe
            ref={ref}
            allow="hid"
            height="300px"
            src={LEDGER_BRIDGE_URL}
            className={classNames('ledger-connector__iframe', {
              _blocked: !!vm.error,
            })}
            onLoad={() => vm.setLoading(false)}
          />
        </div>

        <div className="ledger-connector__footer">
          <Button design="secondary" onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
        </div>
      </div>
    </>
  );
});
