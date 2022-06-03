import { useRpc } from '@app/popup/modules/shared/providers/RpcProvider';
import { useRpcState } from '@app/popup/modules/shared/providers/RpcStateProvider';
import React, { useState } from 'react';
import { LedgerAccountSelector } from '../LedgerAccountSelector';
import { LedgerConnector } from '../LedgerConnector';

enum ConnectLedgerSteps {
  CONNECT,
  SELECT,
}

interface IAccountManager {
  name?: string;
  onBack: () => void;
}

// TODO
export const LedgerAccountManager: React.FC<IAccountManager> = ({
  onBack, name,
}) => {
  const rpc = useRpc();
  const rpcState = useRpcState();
  const [step, setStep] = useState<ConnectLedgerSteps>(ConnectLedgerSteps.SELECT);

  const onSuccess = async () => {
    try {
      if (name) {
        const bufferKey = await rpc.getLedgerMasterKey();
        const masterKey = Buffer.from(Object.values(bufferKey)).toString('hex');
        await rpc.updateMasterKeyName(masterKey, name);
      }

      onBack();
    } catch (e) {
      console.error(e);
      setStep(ConnectLedgerSteps.CONNECT);
    }
  };

  return (
    <>
      {step === ConnectLedgerSteps.CONNECT && (
        <LedgerConnector
          onBack={onBack}
          onNext={() => setStep(ConnectLedgerSteps.SELECT)}
        />
      )}

      {step === ConnectLedgerSteps.SELECT && (
        <LedgerAccountSelector
          onBack={onBack}
          onSuccess={onSuccess}
          onError={() => setStep(ConnectLedgerSteps.CONNECT)}
        />
      )}
    </>
  );
};
