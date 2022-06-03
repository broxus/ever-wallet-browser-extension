import { Input } from '@app/popup/modules/shared';
import React, { forwardRef } from 'react';
import { useIntl } from 'react-intl';

import './CheckSeedInput.scss';

type Props = {
  number: number;
  autoFocus?: boolean;
  name: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// TODO: input prefix/suffix
export const CheckSeedInput = forwardRef<HTMLInputElement, Props>(
  ({ number, autoFocus = false, ...props }, ref) => {
    const intl = useIntl();
    return (
      <div className="check-seed-input">
        <span className="check-seed-input__number">{`${number}. `}</span>
        <Input
          className="check-seed-input__placeholder"
          autoComplete="off"
          placeholder={intl.formatMessage({ id: 'ENTER_THE_WORD_FIELD_PLACEHOLDER' })}
          autoFocus={autoFocus}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
