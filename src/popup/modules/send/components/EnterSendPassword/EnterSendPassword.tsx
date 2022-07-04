import { MessageAmount } from '@app/models';
import {
  AssetIcon,
  Button,
  Input,
  TonAssetIcon,
  Select,
  Footer,
  ButtonGroup,
  Container, Content,
} from '@app/popup/modules/shared';
import { prepareKey } from '@app/popup/utils';
import { convertCurrency, convertPublicKey, convertTokenName, convertTons, NATIVE_CURRENCY } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useIntl } from 'react-intl';

import './EnterSendPassword.scss';

interface Props {
  keyEntries: nt.KeyStoreEntry[];
  keyEntry: nt.KeyStoreEntry;
  amount?: MessageAmount;
  recipient?: string;
  fees?: string;
  error?: string;
  disabled: boolean;
  transactionId?: string;
  masterKeysNames: Record<string, string>;
  onSubmit(password: nt.KeyPassword): void;
  onBack(): void;
  onChangeKeyEntry(keyEntry: nt.KeyStoreEntry): void;
}

export const EnterSendPassword = observer((props: Props): JSX.Element => {
  const {
    keyEntries,
    keyEntry,
    amount,
    recipient,
    fees,
    error,
    disabled,
    transactionId,
    masterKeysNames,
    onSubmit,
    onBack,
    onChangeKeyEntry,
  } = props;
  const intl = useIntl();

  const [submitted, setSubmitted] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const passwordRef = React.useRef<HTMLInputElement>(null);

  const keyEntriesOptions = keyEntries.map((key) => ({
    label: key.name,
    value: key.publicKey,
    ...key,
  }));

  const changeKeyEntry = (_: string, option: any) => {
    if (option != null) {
      const value = { ...option };
      delete value.label;
      delete value.value;
      onChangeKeyEntry(value);
    }
  };

  const trySubmit = async () => {
    let context;

    if (recipient && amount) {
      if (amount.type === 'token_wallet') {
        context = {
          address: recipient,
          amount: amount.data.amount,
          asset: amount.data.symbol,
          decimals: amount.data.decimals,
        };
      } else if (amount.type === 'ton_wallet') {
        context = {
          address: recipient,
          amount: amount.data.amount,
          asset: NATIVE_CURRENCY,
          decimals: 9,
        };
      }
    }

    onSubmit(prepareKey(keyEntry, password, context));
    setSubmitted(true);
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = event.which || event.keyCode;
    if (keyCode === 13) {
      await trySubmit();
    }
  };

  React.useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.scrollIntoView();
    }
  }, []);

  return (
    <Container className="enter-send-password">
      <Content>
        <div className="enter-send-password__confirm-details">
          {recipient && (
            <div key="recipient" className="enter-send-password__confirm-details-param">
              <p className="enter-send-password__confirm-details-param-desc">
                {intl.formatMessage({
                  id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT',
                })}
              </p>
              <span className="enter-send-password__confirm-details-param-value">
                {recipient}
              </span>
            </div>
          )}
          {transactionId && (
            <div
              key="transactionId"
              className="enter-send-password__confirm-details-param"
            >
              <p className="enter-send-password__confirm-details-param-desc">
                {intl.formatMessage({
                  id: 'APPROVE_SEND_MESSAGE_TERM_TRANSACTION_ID',
                })}
              </p>
              <p className="enter-send-password__confirm-details-param-value">
                {transactionId}
              </p>
            </div>
          )}
          {amount?.type === 'token_wallet' && (
            <div className="enter-send-password__confirm-details-param">
              <p className="enter-send-password__confirm-details-param-desc">
                {intl.formatMessage({
                  id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT',
                })}
              </p>
              <div className="enter-send-password__confirm-details-param-value _amount">
                <AssetIcon
                  type="token_wallet"
                  address={amount.data.rootTokenContract}
                  old={amount.data.old}
                  className="root-token-icon noselect"
                />
                <span className="token-amount-text ">
                  {convertCurrency(amount.data.amount, amount.data.decimals)}
                </span>
                &nbsp;
                <span className="root-token-name">
                  {convertTokenName(amount.data.symbol)}
                </span>
              </div>
            </div>
          )}

          {amount && (
            <div className="enter-send-password__confirm-details-param">
              <p className="enter-send-password__confirm-details-param-desc">
                {amount.type === 'ton_wallet' ?
                  intl.formatMessage({
                    id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT',
                  }) :
                  intl.formatMessage({
                    id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT',
                  })}
              </p>
              <div className="enter-send-password__confirm-details-param-value _amount">
                <TonAssetIcon className="root-token-icon noselect" />
                {convertTons(
                  amount.type === 'ton_wallet' ?
                    amount.data.amount :
                    amount.data.attachedAmount,
                )}
                &nbsp;{NATIVE_CURRENCY}
              </div>
            </div>
          )}

          <div key="convertedFees" className="enter-send-password__confirm-details-param">
            <p className="enter-send-password__confirm-details-param-desc">
              {intl.formatMessage({
                id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE',
              })}
            </p>
            <div className="enter-send-password__confirm-details-param-value _amount">
              <TonAssetIcon className="root-token-icon noselect" />
              {fees ?
                `~${convertTons(fees)} ${NATIVE_CURRENCY}` :
                intl.formatMessage({
                  id: 'CALCULATING_HINT',
                })}
            </div>
          </div>
        </div>
        {keyEntries.length > 1 ? (
          <Select
            className="enter-send-password__field-select"
            options={keyEntriesOptions}
            value={keyEntry.publicKey}
            onChange={changeKeyEntry}
          />
        ) : null}
        {keyEntry.signerName !== 'ledger_key' ? (
          <>
            <Input
              autoFocus
              className="enter-send-password__field-password"
              type="password"
              placeholder={intl.formatMessage({
                id: 'APPROVE_SEND_MESSAGE_PASSWORD_FIELD_PLACEHOLDER',
              })}
              ref={passwordRef}
              disabled={disabled}
              value={password}
              onKeyDown={onKeyDown}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="enter-send-password__field-hint">
              {intl.formatMessage(
                { id: 'APPROVE_SEND_MESSAGE_PASSWORD_FIELD_HINT' },
                {
                  name: masterKeysNames[keyEntry.masterKey] || convertPublicKey(keyEntry.masterKey),
                },
              )}
            </div>
          </>
        ) : (
          <div className="enter-send-password__ledger-confirm">
            {intl.formatMessage({
              id: 'APPROVE_SEND_MESSAGE_APPROVE_WITH_LEDGER_HINT',
            })}
          </div>
        )}
        {error && <div className="enter-send-password__error-message">{error}</div>}
      </Content>

      <Footer>
        <ButtonGroup>
          <Button group="small" design="secondary" disabled={submitted && !error} onClick={onBack}>
            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
          </Button>
          <Button
            disabled={
              disabled ||
              (keyEntry.signerName !== 'ledger_key' && password.length === 0) ||
              (submitted && !error)
            }
            onClick={trySubmit}
          >
            {intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
          </Button>
        </ButtonGroup>
      </Footer>
    </Container>
  );
});
