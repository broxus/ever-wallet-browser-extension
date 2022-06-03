import AddAccount from '@app/popup/assets/img/add-account.svg';
import React, { memo } from 'react';
import { useIntl } from 'react-intl';

import './AddNewAccountCard.scss';

interface Props {
  onClick: () => void;
}

export const AddNewAccountCard = memo(({ onClick }: Props): JSX.Element => {
  const intl = useIntl();

  return (
    <div className="new-account" onClick={onClick}>
      <div className="new-account__icon">
        <img src={AddAccount} alt="" />
      </div>
      <div className="new-account__title">
        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_HEADER' })}
      </div>
      <div className="new-account__comment">
        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADD_ACCOUNT_NOTE' })}
      </div>
    </div>
  );
});
