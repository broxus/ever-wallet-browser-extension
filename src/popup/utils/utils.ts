import Decimal from 'decimal.js';
import type nt from 'nekoton-wasm';

Decimal.set({ maxE: 500, minE: -500 });

export const parseError = (error: any) => error?.toString?.().replace(/Error: /gi, '');

export const formatSeed = (seed: string) => seed?.split(/[, ;\r\n\t]+/g).filter((el) => el !== '');

export const prepareKey = (
  entry: nt.KeyStoreEntry,
  password: string,
  context?: nt.LedgerSignatureContext,
): nt.KeyPassword => {
  switch (entry.signerName) {
    case 'encrypted_key': {
      return {
        type: entry.signerName,
        data: {
          publicKey: entry.publicKey,
          password,
        },
      } as nt.KeyPassword;
    }

    case 'master_key': {
      return {
        type: entry.signerName,
        data: {
          masterKey: entry.masterKey,
          publicKey: entry.publicKey,
          password,
        },
      };
    }

    case 'ledger_key': {
      return {
        type: entry.signerName,
        data: {
          publicKey: entry.publicKey,
          context,
        },
      };
    }

    default: throw new Error(`Unknown signer name: ${entry?.signerName}`);
  }
};
