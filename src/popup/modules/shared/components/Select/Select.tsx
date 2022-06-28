import ArrowDown from '@app/popup/assets/img/arrow-down.svg';
import RcSelect, { SelectProps, BaseSelectRef } from 'rc-select';
import React, { forwardRef } from 'react';

import './Select.scss';

function InternalSelect<T>(props: SelectProps<T>, ref: React.Ref<BaseSelectRef>): JSX.Element {
  return (
    <RcSelect<T>
      ref={ref}
      transitionName="rc-slide-up"
      inputIcon={<img src={ArrowDown} alt="More" />}
      getPopupContainer={(trigger) => trigger.closest('.rc-select') || document.body}
      {...props}
    />
  );
}

export const Select = forwardRef(InternalSelect) as typeof InternalSelect;
