import { UserAvatar } from '@app/popup/modules/account';
import { Button, CopyButton, CopyText } from '@app/popup/modules/shared';
import { NATIVE_CURRENCY } from '@app/shared';
import React, { memo } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';

import './Receive.scss';

interface Props {
  accountName?: string;
  address: string;
  currencyName?: string;
}

export const Receive = memo(({ accountName, address, currencyName }: Props): JSX.Element => {
  const intl = useIntl();

  return (
    <div className="receive-screen">
      <div className="receive-screen__account_details">
        <UserAvatar address={address} />
        <span className="receive-screen__account_details-title">{accountName || ''}</span>
      </div>

      <h3 className="receive-screen__form-title noselect">
        {intl.formatMessage(
          { id: 'RECEIVE_ASSET_LEAD_TEXT' },
          { symbol: currencyName || NATIVE_CURRENCY },
        )}
      </h3>
      <div className="receive-screen__qr-code">
        <div className="receive-screen__qr-code-code">
          <QRCode value={`ton://chat/${address}`} size={80} />
        </div>
        <div className="receive-screen__qr-code-address">
          <CopyText text={address} />
        </div>
      </div>

      <CopyButton text={address}>
        <Button>
          {intl.formatMessage({ id: 'COPY_ADDRESS_BTN_TEXT' })}
        </Button>
      </CopyButton>
    </div>
  );
});
