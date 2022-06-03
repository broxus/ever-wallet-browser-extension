import { LocalizationStore, useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { RawIntlProvider } from 'react-intl';

type Props = React.PropsWithChildren<{}>;

export const LocalizationProvider = observer(({ children }: Props): JSX.Element => {
  const localizationStore = useResolve(LocalizationStore);

  return (
    <RawIntlProvider value={localizationStore.intl}>
      {children}
    </RawIntlProvider>
  );
});
