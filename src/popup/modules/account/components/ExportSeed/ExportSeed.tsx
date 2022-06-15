import { Button, ButtonGroup, Container, Content, Footer, Header, Input, useResolve } from '@app/popup/modules/shared';
import { observer } from 'mobx-react-lite';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { ExportSeedViewModel, Step } from './ExportSeedViewModel';

interface Props {
  onBack(): void;
}

export const ExportSeed = observer(({ onBack }: Props): JSX.Element => {
  const vm = useResolve(ExportSeedViewModel);
  const intl = useIntl();

  const { register, handleSubmit, formState } = useForm<{ password: string }>();

  return (
    <>
      {vm.step.is(Step.PasswordRequest) && (
        <Container key="passwordRequest" className="accounts-management">
          <Header>
            <h2>
              {intl.formatMessage({ id: 'EXPORT_SEED_PANEL_HEADER' })}
            </h2>
          </Header>

          <Content>
            <form id="password-request" onSubmit={handleSubmit(vm.onSubmit)}>
              <div className="accounts-management__content-form-rows">
                <div className="accounts-management__content-form-row">
                  <Input
                    type="password"
                    disabled={vm.inProcess}
                    placeholder={intl.formatMessage({
                      id: 'ENTER_SEED_PASSWORD_FIELD_PLACEHOLDER',
                    })}
                    {...register('password', {
                      required: true,
                      minLength: 6,
                    })}
                  />

                  {(formState.errors.password || vm.error) && (
                    <div className="accounts-management__content-error">
                      {formState.errors.password && intl.formatMessage({ id: 'ERROR_PASSWORD_IS_REQUIRED_FIELD' })}
                      {vm.error}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Content>

          <Footer>
            <ButtonGroup>
              <Button group="small" design="secondary" disabled={vm.inProcess} onClick={onBack}>
                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
              </Button>
              <Button type="submit" form="password-request" disabled={vm.inProcess}>
                {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
              </Button>
            </ButtonGroup>
          </Footer>
        </Container>
      )}

      {(vm.step.is(Step.CopySeedPhrase) || vm.step.is(Step.SeedPhraseCopied)) && (
        <Container key="copySeedPhrase" className="accounts-management">
          <Header>
            <h2>
              {intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' })}
            </h2>
          </Header>

          <Content>
            <ol className="accounts-management__seed-list">
              {vm.seedPhrase?.map((item) => (
                <li key={item} className="accounts-management__seed-list-item">
                  {item.toLowerCase()}
                </li>
              ))}
            </ol>
          </Content>

          <Footer>
            <ButtonGroup>
              <Button group="small" design="secondary" onClick={onBack}>
                {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
              </Button>

              {vm.step.is(Step.CopySeedPhrase) && (
                <CopyToClipboard text={vm.seedPhrase.join(' ')} onCopy={vm.step.setSeedPhraseCopied}>
                  <Button>
                    {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                  </Button>
                </CopyToClipboard>
              )}

              {vm.step.is(Step.SeedPhraseCopied) && (
                <>
                  <Button data-for="copy" data-tip={intl.formatMessage({ id: 'COPIED_TOOLTIP' })} onClick={onBack}>
                    {intl.formatMessage({ id: 'SAVE_IT_DOWN_BTN_TEXT' })}
                  </Button>
                  <ReactTooltip id="copy" type="dark" effect="solid" place="top" />
                </>
              )}
            </ButtonGroup>
          </Footer>
        </Container>
      )}
    </>
  );
});
