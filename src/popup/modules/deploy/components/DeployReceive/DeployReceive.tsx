import { Button, Content, CopyButton, CopyText, Footer } from '@app/popup/modules/shared';
import { convertTons, NATIVE_CURRENCY } from '@app/shared';
import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';

import './DeployReceive.scss';

interface Props {
  address: string;
  totalAmount: string;
}

export const DeployReceive = memo(({ address, totalAmount }: Props): JSX.Element => {
  const intl = useIntl();

  return (
    <>
      <Content className="deploy-receive">
        <p className="deploy-receive__comment">
          {intl.formatMessage(
            { id: 'DEPLOY_WALLET_DRAWER_INSUFFICIENT_BALANCE_HINT' },
            {
              value: convertTons(totalAmount),
              symbol: NATIVE_CURRENCY,
            },
          )}
        </p>

        <h3 className="deploy-receive__header">
          {intl.formatMessage(
            { id: 'DEPLOY_WALLET_DRAWER_ADDRESS_COPY_HEADING' },
            { symbol: NATIVE_CURRENCY },
          )}
        </h3>

        <div className="deploy-receive__qr-code">
          <div className="deploy-receive__qr-code-code">
            <QRCode value={`ton://chat/${address}`} size={80} />
          </div>
          <div className="deploy-receive__qr-code-address">
            <CopyText text={address} />
          </div>
        </div>
      </Content>

      <Footer>
        <CopyButton text={address}>
          <Button>
            {intl.formatMessage({ id: 'COPY_ADDRESS_BTN_TEXT' })}
          </Button>
        </CopyButton>
      </Footer>
    </>
  );
});
