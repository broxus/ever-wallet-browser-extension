import React, { useCallback, useRef } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';

type Props = {
  id?: string;
  text: string;
  children: React.ReactElement;
};

// TODO: replace CopyButton/CopyButton with hook or component
export function CopyButton({ children, id = 'copy-button', text }: Props): JSX.Element {
  const intl = useIntl();
  const ref = useRef();

  const handleCopy = useCallback(() => setTimeout(() => {
    if (ref.current) {
      ReactTooltip.hide(ref.current);
    }
  }, 2000), []);

  return (
    <>
      <CopyToClipboard text={text} onCopy={handleCopy}>
        {React.cloneElement(children, {
          ref,
          'data-for': id,
          'data-tip': intl.formatMessage({ id: 'COPIED_TOOLTIP' }),
          'data-event': 'click',
          'data-iscapture': true,
        })}
      </CopyToClipboard>
      <ReactTooltip id={id} type="dark" effect="solid" place="top" />
    </>
  );
}
