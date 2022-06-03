import { createEnumField, LocalizationStore, RpcStore } from '@app/popup/modules/shared';
import { parseError } from '@app/popup/utils';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { injectable } from 'tsyringe';

@injectable()
export class WelcomePageViewModel {
  step = createEnumField(Step, Step.Welcome);
  restoreInProcess = false;
  restoreError: any = null;

  constructor(
    private rpcStore: RpcStore,
    private localization: LocalizationStore,
  ) {
    makeObservable(this, {
      restoreInProcess: observable,
      restoreError: observable,
      selectedLocale: computed,
      restoreFromBackup: action,
    });
  }

  get selectedLocale() {
    return this.rpcStore.state.selectedLocale;
  }

  setEnglishLocale = () => this.localization.setLocale('en');

  setKoreanLocale = () => this.localization.setLocale('ko');

  restoreFromBackup = async () => {
    if (this.restoreInProcess) return;

    this.restoreInProcess = true;

    try {
      const file = await this.updateFile();
      const storage = file ? await this.readFile(file) : null;
      const result = storage ? await this.rpcStore.rpc.importStorage(storage) : false;

      if (!file || !storage) {
        return;
      }

      if (!result) {
        throw new Error('Failed to import storage');
      }

      window.close();
    } catch (e) {
      runInAction(() => {
        this.restoreError = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.restoreInProcess = false;
      });
    }
  };

  private readFile(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (_error) => {
        reject(reader.error);
      };
      reader.readAsText(file);
    });
  }

  private updateFile(): Promise<File | undefined> {
    let lock = false;
    return new Promise<File | undefined>((resolve) => {
      // create input file
      const input = document.createElement('input');
      input.id = (+new Date()).toString();
      input.style.display = 'none';
      input.setAttribute('type', 'file');
      document.body.appendChild(input);

      input.addEventListener(
        'change',
        () => {
          lock = true;
          const file = input.files?.[0];
          resolve(file);
          // remove dom
          const fileInput = document.getElementById(input.id);
          fileInput?.remove();
        },
        { once: true },
      );

      // file blur
      window.addEventListener(
        'focus',
        () => {
          setTimeout(() => {
            if (!lock && document.getElementById(input.id)) {
              resolve(undefined);
              // remove dom
              const fileInput = document.getElementById(input.id);
              fileInput?.remove();
            }
          }, 300);
        },
        { once: true },
      );

      // open file select box
      input.click();
    });
  }
}

export enum Step {
  Welcome,
  CreateAccount,
  ImportAccount,
  LedgerAccount,
}
