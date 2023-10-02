import type * as nt from '@broxus/ever-wallet-wasm'
import type { FunctionCall, Permission, RawPermissions } from 'everscale-inpage-provider'

export type WindowGroup =
    | 'manage_seeds'
    | 'send'
    | 'approval'
    | 'deploy_multisig_wallet'
    | 'stake'
    | 'transfer_nft'
    | 'transfer_nft_token'
    | 'network_settings'
    | 'contacts'

export type WindowInfo = {
    group?: WindowGroup
    approvalTabId?: number
    approvalFrameId?: number
};

export type ExternalWindowParams = {
    group: WindowGroup
    width?: number
    height?: number
};

export type MasterKeyToCreate = {
    seed: nt.GeneratedMnemonic
    password: string
    name?: string
    select: boolean
};

export type KeyToDerive = {
    masterKey: string
    accountId: number
    password: string
    name?: string
};

export type KeyToRemove = {
    publicKey: string
};

export type LedgerKeyToCreate = {
    name?: string
    accountId: number
};

export type TokenWalletsToUpdate = {
    [rootTokenContract: string]: boolean
};

export type DeployMessageToPrepare =
    | { type: 'single_owner' }
    | { type: 'multiple_owners'; custodians: string[]; reqConfirms: number; expirationTime?: number; };

export type TransferMessageToPrepare = {
    publicKey: string
    amount: string
    recipient: string
    payload?: string
    bounce?: boolean
};

export type ConfirmMessageToPrepare = {
    publicKey: string
    transactionId: string
};

export type TokenMessageToPrepare = {
    amount: string
    recipient: string
    payload?: string
    notifyReceiver: boolean
};

export type WalletMessageToSend = {
    signedMessage: nt.SignedMessage
    info: BriefMessageInfo
};

export type BriefMessageInfo =
    | nt.EnumItem<'deploy', void>
    | nt.EnumItem<'confirm', void>
    | nt.EnumItem<'transfer', {
        amount: string;
        recipient: string;
    }>;

export type StoredBriefMessageInfo = BriefMessageInfo & nt.PendingTransaction & { createdAt: number; };

export interface Approval<T extends string, D> {
    id: string;
    origin: string;
    time: number;
    type: T;
    requestData?: D;
}

export type GqlSocketParams = {
    // Path to graphql api endpoints, e.g. `https://main.ton.dev`
    endpoints: string[]
    // Frequency of sync latency detection
    latencyDetectionInterval: number
    // Maximum value for the endpoint's blockchain data sync latency
    maxLatency: number
    // Gql node type
    local: boolean
};

export type JrpcSocketParams = {
    // Path to jrpc api endpoint
    endpoint: string
};

export type ProtoSocketParams = JrpcSocketParams & {};

export type NetworkGroup = 'mainnet' | 'testnet' | 'fld' | 'rfld' | 'localnet' | string

export type ConnectionData = {
    name: string;
    group: NetworkGroup;
    config: NetworkConfig;
    custom?: boolean;
} & (
    | nt.EnumItem<'graphql', GqlSocketParams>
    | nt.EnumItem<'jrpc', JrpcSocketParams>
    | nt.EnumItem<'proto', ProtoSocketParams>
);

export type ConnectionDataItem = { connectionId: number } & ConnectionData;

export type UpdateCustomNetwork = {
    connectionId?: number;
    name: string;
    config: NetworkConfig;
} & (
    | nt.EnumItem<'graphql', GqlSocketParams>
    | nt.EnumItem<'jrpc', JrpcSocketParams>
    | nt.EnumItem<'proto', ProtoSocketParams>
);

export type NetworkConfig = {
    symbol?: string;
    explorerBaseUrl?: string;
    tokensManifestUrl?: string;
};

export type ApprovalApi = {
    requestPermissions: {
        input: {
            permissions: Permission[]
        }
        output: Partial<RawPermissions>
    }
    changeAccount: {
        input: {}
        output: RawPermissions['accountInteraction']
    }
    addTip3Token: {
        input: {
            account: string
            details: nt.RootTokenContractDetailsWithAddress
        }
        output: {}
    }
    signData: {
        input: {
            publicKey: string
            data: string
        }
        output: nt.KeyPassword
    }
    encryptData: {
        input: {
            publicKey: string
            data: string
        }
        output: nt.KeyPassword
    }
    decryptData: {
        input: {
            publicKey: string
            sourcePublicKey: string
        }
        output: nt.KeyPassword
    }
    callContractMethod: {
        input: {
            publicKey: string
            recipient: string
            payload: FunctionCall<string>
        }
        output: nt.KeyPassword
    }
    sendMessage: {
        input: {
            sender: string
            recipient: string
            amount: string
            bounce: boolean
            payload?: FunctionCall<string>
            knownPayload: nt.KnownPayload | undefined
        }
        output: nt.KeyPassword
    }
};

export type PendingApproval<T> = T extends keyof ApprovalApi
    ? ApprovalApi[T]['input'] extends undefined
        ? Approval<T, undefined>
        : Approval<T, {}> & { requestData: ApprovalApi[T]['input'] }
    : never;

export type ApprovalOutput<T extends keyof ApprovalApi> = ApprovalApi[T]['output'];

export type SubmitTransaction = nt.Transaction & {
    info: {
        type: 'wallet_interaction'
        data: {
            knownPayload: nt.KnownPayload | undefined
            method: {
                type: 'multisig'
                data: {
                    type: 'submit'
                    data: nt.MultisigSubmitTransactionInfo
                }
            }
        }
    }
};

export type ConfirmTransaction = nt.Transaction & {
    info: {
        type: 'wallet_interaction'
        data: {
            knownPayload: nt.KnownPayload | undefined
            method: {
                type: 'multisig'
                data: {
                    type: 'confirm'
                    data: nt.MultisigConfirmTransactionInfo
                }
            }
        }
    }
};

export type MessageAmount =
    | nt.EnumItem<'ever_wallet', { amount: string }>
    | nt.EnumItem<'token_wallet', {
    amount: string
    attachedAmount: string
    symbol: string
    decimals: number
    rootTokenContract: string
    old: boolean
}>;

export type TriggerUiParams = ExternalWindowParams & {
    force: boolean;
    owner?: string;
}

export interface PendingApprovalInfo {
    tabId: number;
    frameId?: number;
}

export interface NftCollection {
    address: string;
    name: string;
    description: string;
    preview?: string;
}

export interface Nft {
    id: string;
    address: string;
    collection: string;
    manager: string;
    owner: string;
    name: string;
    description: string;
    preview?: string;
    img?: string;
    supply?: string;
    balance?: string;
}

export interface BaseNftJson {
    name?: string;
    description?: string;
    preview?: {
        source?: string;
        mimetype?: string;
    },
    files?: Array<{
        source?: string;
        mimetype?: string;
    }>,
    external_url?: string;
}

export type NftType = 'nft' | 'fungible';

export interface GetNftsParams {
    type: NftType;
    collection: string;
    owner: string;
    limit: number;
    continuation?: string | undefined;
}

export interface GetNftsResult {
    nfts: Nft[];
    continuation: string | undefined;
    type: NftType;
}

export interface NftTransferToPrepare {
    recipient: string;
    sendGasTo: string;
    callbacks: Record<string, nt.NftCallbackPayload>
}

export interface NftTokenTransferToPrepare {
    count: string;
    recipient: string;
    remainingGasTo: string;
}

export interface PendingNft {
    id: string;
    collection: string;
}

export interface NftTransfer {
    oldOwner: string;
    newOwner: string;
    id: string;
    collection: string;
}

export interface NftTokenTransfer {
    type: 'in' | 'out';
    id: string;
    collection: string;
    sender: string;
    recipient: string;
}

export interface RawContact {
    type: 'address' | 'public_key';
    value: string;
}

export interface Contact extends RawContact {
    name: string;
}

export interface DensContact {
    path: string;
    target: string;
    contract: string;
}

export type RpcEvent =
    | nt.EnumItem<'ledger', { result: 'connected' | 'failed' }>
    | nt.EnumItem<'ntf-transfer', NftTransfer[]>
    | nt.EnumItem<'ntf-token-transfer', NftTokenTransfer[]>

export type ExternalAccount = { address: string; externalIn: string[]; publicKey: string }
