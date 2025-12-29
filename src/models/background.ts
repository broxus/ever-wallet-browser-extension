import type * as nt from '@broxus/ever-wallet-wasm'
import type { AddNetwork, FunctionCall, IgnoreTransactionTreeSimulationError, Network, Permission, RawPermissions, NetworkConfig } from 'everscale-inpage-provider'

import { type NetworkData } from '@app/shared/config'

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
    | 'create_account'

export type WindowInfo = {
    group?: WindowGroup;
    approvalTabId?: number;
    approvalFrameId?: number;
}

export type ExternalWindowParams = {
    group: WindowGroup;
    width?: number;
    height?: number;
}

export type MasterKeyToCreate = {
    seed: nt.GeneratedMnemonic;
    password: string;
    name?: string;
    select: boolean;
}

export type UserMnemonic = 'TONStandard' | 'TONBip39' | 'TONTypesWallet' | 'SparXWallet'

export type KeyToDerive = {
    masterKey: string;
    accountId: number;
    password: string;
    name?: string;
}

export type KeyToRemove = {
    publicKey: string;
}

export type LedgerKeyToCreate = {
    name?: string;
    accountId: number;
}

export type TokenWalletsToUpdate = {
    [rootTokenContract: string]: boolean;
}

export type DeployMessageToPrepare = { type: 'single_owner' } | { type: 'multiple_owners'; custodians: string[]; reqConfirms: number; expirationTime?: number }

export type TransferMessageToPrepare = {
    publicKey: string;
    params: {
        amount: string;
        recipient: string;
        payload?: string;
        bounce?: boolean;
        stateInit?: string;
    }[];
}

export type TransactionTreeSimulationParams<T = string> = {
    ignoredComputePhaseCodes?: IgnoreTransactionTreeSimulationError<T>[];
    ignoredActionPhaseCodes?: IgnoreTransactionTreeSimulationError<T>[];
}

export type ConfirmMessageToPrepare = {
    publicKey: string;
    transactionId: string;
}

export type TokenMessageToPrepare = {
    amount: string;
    recipient: string;
    payload?: string;
    attachedAmount?: string;
    remainingGasTo?: string;
    notifyReceiver: boolean;
}

export type WalletMessageToSend = {
    signedMessage: nt.SignedMessage;
    info: BriefMessageInfo;
}

export type BriefMessageInfo =
    | nt.EnumItem<'deploy', void>
    | nt.EnumItem<'confirm', void>
    | nt.EnumItem<
          'transfer',
          {
              amount: string;
              recipient: string;
          }
      >

export type StoredBriefMessageInfo = BriefMessageInfo & nt.PendingTransaction & { createdAt: number }

export interface Approval<T extends string, D> {
    id: string;
    origin: string;
    time: number;
    type: T;
    requestData?: D;
}

export type GqlSocketParams = {
    // Path to graphql api endpoints, e.g. `https://main.ton.dev`
    endpoints: string[];
    // Frequency of sync latency detection
    latencyDetectionInterval: number;
    // Maximum value for the endpoint's blockchain data sync latency
    maxLatency: number;
    // Gql node type
    local: boolean;
}

export type JrpcSocketParams = {
    // Path to jrpc api endpoint
    endpoint: string;
}

export type ProtoSocketParams = JrpcSocketParams & {}

export type SocketParams = (
    | nt.EnumItem<'graphql', GqlSocketParams>
    | nt.EnumItem<'jrpc', JrpcSocketParams>
    | nt.EnumItem<'proto', ProtoSocketParams>
)

export type ConnectionData = Omit<NetworkData, 'type'> & {
    workchainId: number;
    custom?: boolean;
} & SocketParams

export type ConnectionDataItem = {
    description?: nt.NetworkDescription,
} & ConnectionData

export type UpdateCustomNetwork = {
    id?: string;
    name: string;
    workchainId?: number;
    config: NetworkConfig
} & (
    | nt.EnumItem<'graphql', GqlSocketParams>
    | nt.EnumItem<'jrpc', JrpcSocketParams>
    | nt.EnumItem<'proto', ProtoSocketParams>
)

// export type NetworkConfig = {
//     symbol?: string;
//     explorerBaseUrl?: string;
//     tokensManifestUrl?: string;
//     decimals?: number;
// };

export type TonProviderApi = {
    tonConnect: {
        input: TonConnectRequest;
        output: TonConnectItemReply[];
    };
    tonDisconnect: {
        input: [];
        output: [];
    };
    tonReconnect: {
        input: [];
        output: TonConnectItemReply[];
    };
    tonSignData: {
        input: TonSignDataRpcRequest['params'];
        output: TonSignDataRpcResponseSuccess['result'];
    };
    tonSendTransaction: {
        input: TonSendTransactionRpcRequest['params'];
        output: string;
    };
}

export type ApprovalApi = {
    tonConnect: {
        input: TonConnectRequest;
        output: {
            replyItems: TonConnectItemReply[],
            wallet: nt.TonWalletAsset,
        };
    };
    tonSendMessage: {
        input: {
            sender?: string;
            params: nt.TonWalletTransferParams[];
        };
        output: nt.KeyPassword;
    };
    requestPermissions: {
        input: {
            permissions: Permission[];
        };
        output: Partial<RawPermissions>;
    };
    changeAccount: {
        input: {};
        output: RawPermissions['accountInteraction'];
    };
    addTip3Token: {
        input: {
            account: string;
            details: nt.RootTokenContractDetailsWithAddress;
        };
        output: {};
    };
    signData: {
        input: {
            publicKey?: string;
            data: string;
        };
        output: nt.KeyPassword;
    };
    encryptData: {
        input: {
            publicKey: string;
            data: string;
        };
        output: nt.KeyPassword;
    };
    decryptData: {
        input: {
            publicKey: string;
            sourcePublicKey: string;
        };
        output: nt.KeyPassword;
    };
    callContractMethod: {
        input: {
            publicKey: string;
            recipient: string;
            payload: FunctionCall<string>;
        };
        output: nt.KeyPassword;
    };
    sendMessage: {
        input: {
            sender: string
            recipient: string
            amount: string
            bounce: boolean
            payload?: FunctionCall<string>
            knownPayload: nt.KnownPayload | undefined
            ignoredComputePhaseCodes?: IgnoreTransactionTreeSimulationError<string>[]
            ignoredActionPhaseCodes?: IgnoreTransactionTreeSimulationError<string>[]
        }
        output: nt.KeyPassword
    }
    changeNetwork: {
        input: {
            networkId: number;
        };
        output: Network | null;
    };
    addNetwork: {
        input: {
            addNetwork: AddNetwork;
            switchNetwork: boolean;
        };
        output: Network | null;
    };
}

export type ApprovalType = keyof ApprovalApi

export type PendingApproval<T> = T extends ApprovalType ? (ApprovalApi[T]['input'] extends undefined ? Approval<T, undefined> : Approval<T, {}> & { requestData: ApprovalApi[T]['input'] }) : never

export type ApprovalOutput<T extends ApprovalType> = ApprovalApi[T]['output']

export type SubmitTransaction = nt.Transaction & {
    info: {
        type: 'wallet_interaction';
        data: {
            knownPayload: nt.KnownPayload | undefined;
            method: {
                type: 'multisig';
                data: {
                    type: 'submit';
                    data: nt.MultisigSubmitTransactionInfo;
                };
            };
        };
    };
}

export type ConfirmTransaction = nt.Transaction & {
    info: {
        type: 'wallet_interaction';
        data: {
            knownPayload: nt.KnownPayload | undefined;
            method: {
                type: 'multisig';
                data: {
                    type: 'confirm';
                    data: nt.MultisigConfirmTransactionInfo;
                };
            };
        };
    };
}

export type MessageAmount =
    | nt.EnumItem<'ever_wallet', { amount: string }>
    | nt.EnumItem<
          'token_wallet',
          {
              amount: string;
              attachedAmount: string;
              symbol: string;
              decimals: number;
              rootTokenContract: string;
              old: boolean;
          }
      >

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
    manager?: string;
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
        mime_type?: string;
    };
    files?: Array<{
        source?: string;
        mimetype?: string;
        mime_type?: string;
    }>;
    external_url?: string;
}

export type NftType = 'nft' | 'fungible'

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
    callbacks: Record<string, nt.NftCallbackPayload>;
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

export type RpcEvent = nt.EnumItem<'ledger', { result: 'connected' | 'failed' }> | nt.EnumItem<'ntf-transfer', NftTransfer[]> | nt.EnumItem<'ntf-token-transfer', NftTokenTransfer[]> | nt.EnumItem<'close-modals', {}>

export type ExternalAccount = { address: string; externalIn: string[]; publicKey: string }

export type TokenWalletTransaction = nt.TokenWalletTransaction | nt.JettonWalletTransaction

export interface JettonSymbol {
    name: string;
    fullName: string;
    decimals: number;
    rootTokenContract: string;
    uri?: string;
}

export interface DeployInputParams {
    workchain?: number;
    initDataCell: string;
    initCodeCell: string;
    initMessageCell?: string;
    amount: string;
}

export interface DeployOutputParams {
    walletSeqNo: number;
    newContractAddress: string;
}

export interface RawSignInputParams {
    data: string; // Cell boc hex
}

export interface SwitchNetworkParams {
    network: string;
}

export interface ConnectDAppParams {
    publicKey?: boolean;
}

export interface ConnectDAppPublicKey {
    address: string;
    version: 'v2R1' | 'v2R2' | 'v3R1' | 'v3R2' | 'v4R1' | 'v4R2';
    publicKey: string;
}

export type ConnectDAppOutputParams = (string | ConnectDAppPublicKey)[]

/**
 * Ton Connect
 */
export type TonAppMessage = TonAppRequest<keyof TonRpcRequests>

export type TonAppRequest<T extends TonRpcMethod> = TonRpcRequests[T]

export const enum TON_CHAIN {
    MAINNET = '-239',
    TESTNET = '-3',
}

export const enum TON_CONNECT_EVENT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    MANIFEST_NOT_FOUND_ERROR = 2,
    MANIFEST_CONTENT_ERROR = 3,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400,
}

export const enum TON_CONNECT_ITEM_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    METHOD_NOT_SUPPORTED = 400,
}

export type TonConnectEvent = TonConnectEventSuccess | TonConnectEventError

export interface TonConnectEventError {
    event: 'connect_error';
    id: number;
    payload: {
        code: TON_CONNECT_EVENT_ERROR_CODES;
        message: string;
    };
}

export interface TonConnectEventSuccess {
    event: 'connect';
    id: number;
    payload: {
        items: TonConnectItemReply[];
        device: DeviceInfo;
    };
}

export type TonConnectItem = TonAddressItem | TonProofItem

export type TonConnectItemReply = TonAddressItemReply | TonProofItemReply

export type TonConnectItemReplyError<T> = {
    name: T;
    error: {
        code: TON_CONNECT_ITEM_ERROR_CODES;
        message?: string;
    };
}

export interface TonConnectRequest {
    manifestUrl: string;
    items: TonConnectItem[];
}

export interface DeviceInfo {
    platform: 'iphone' | 'ipad' | 'android' | 'windows' | 'mac' | 'linux' | 'browser';
    appName: string;
    appVersion: string;
    maxProtocolVersion: number;
    features: TonFeature[];
}

export enum TON_DISCONNECT_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    METHOD_NOT_SUPPORTED = 400,
}

export interface TonDisconnectEvent {
    event: 'disconnect';
    id: number;
    payload: {};
}

export interface TonDisconnectRpcRequest {
    method: 'disconnect';
    params: [];
    id: string;
}

export type TonDisconnectRpcResponse = TonDisconnectRpcResponseSuccess | TonDisconnectRpcResponseError

export interface TonDisconnectRpcResponseError extends TonWalletResponseTemplateError {
    event: 'disconnect',
    error: {
        code: TON_DISCONNECT_ERROR_CODES;
        message: string;
        data?: unknown;
    };
    id: string;
}

export interface TonDisconnectRpcResponseSuccess {
    id: string;
    result: {};
}

export type TonFeature = TonSendTransactionFeatureDeprecated | TonSendTransactionFeature | TonSignDataFeature

export interface KeyPair {
    publicKey: string;
    secretKey: string;
}

export type TonRpcMethod = 'connect' | 'disconnect' | 'sendTransaction' | 'signData'

export type TonRpcRequests = {
    sendTransaction: TonSendTransactionRpcRequest;
    signData: TonSignDataRpcRequest;
    disconnect: TonDisconnectRpcRequest;
    connect: TonConnectRequest;
}

export type TonRpcResponses = {
    sendTransaction: {
        error: TonSendTransactionRpcResponseError;
        success: TonSendTransactionRpcResponseSuccess;
    };
    signData: {
        error: TonSignDataRpcResponseError;
        success: TonSignDataRpcResponseSuccess;
    };
    disconnect: {
        error: TonDisconnectRpcResponseError;
        success: TonDisconnectRpcResponseSuccess;
    };
    connect: {
        error: TonConnectEventError;
        success: TonConnectEventSuccess;
    };
}

export const enum TON_SEND_TRANSACTION_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    MANIFEST_NOT_FOUND_ERROR = 2,
    MANIFEST_CONTENT_ERROR = 3,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400,
}

export type TonSendTransactionFeature = {
    name: 'SendTransaction';
    maxMessages: number;
    extraCurrencySupported?: boolean;
}

export type TonSendTransactionFeatureDeprecated = 'SendTransaction'

export interface TonSendTransactionRpcRequest {
    method: 'sendTransaction';
    params: [string];
    id: string;
}

export type TonSendTransactionPayload = {
    valid_until?: number;
    from?: string;
    network?: TON_CHAIN;
    messages: { address: string; amount: string; payload?: string; stateInit?: string }[];
}

export type TonSendTransactionRpcResponse = TonSendTransactionRpcResponseSuccess | TonSendTransactionRpcResponseError

export interface TonSendTransactionRpcResponseError extends TonWalletResponseTemplateError {
    error: {
        code: TON_SEND_TRANSACTION_ERROR_CODES;
        message: string;
        data?: unknown;
    };
    id: string;
}

export interface TonSendTransactionRpcResponseSuccess extends WalletResponseTemplateSuccess {}

export enum TON_SIGN_DATA_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400,
}

export type TonSignDataFeature = {
    name: 'SignData';
}

export interface TonSignDataRpcRequest {
    method: 'signData';
    params: [string];
    id: string;
}

export type TonSignDataPayload = SignDataRequestPayloadText | SignDataRequestPayloadBinary | SignDataRequestPayloadCell


export type SignDataRequestPayloadCell = {
    type: 'cell';
    schema: string;
    cell: string;
    from?: string;
    network?: TON_CHAIN
}

export type SignDataRequestPayloadText = {
    type: 'text';
    text: string;
    from?: string;
    network?: TON_CHAIN
}

export type SignDataRequestPayloadBinary = {
    type: 'binary';
    bytes: string;
    from?: string;
    network?: TON_CHAIN
}

export type TonSignDataRpcResponse = TonSignDataRpcResponseSuccess | TonSignDataRpcResponseError

export interface TonSignDataRpcResponseError extends TonWalletResponseTemplateError {
    error: {
        code: TON_SIGN_DATA_ERROR_CODES;
        message: string;
        data?: unknown;
    };
    id: string;
}

export interface TonSignDataRpcResponseSuccess {
    id: string;
    result: {
        signature: string;
        address: string;
        timestamp: number;
        domain: string;
        payload: any;
    };
}

export interface TonAddressItem {
    name: 'ton_addr';
}

export interface TonAddressItemReply {
    name: 'ton_addr';
    address: string;
    network: string;
    walletStateInit: string;
    publicKey: string;
}

export interface TonProofItem {
    name: 'ton_proof';
    payload: string;
}

export type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError

export type TonProofItemReplyError = TonConnectItemReplyError<TonProofItemReplySuccess['name']>

export interface TonProofItemReplySuccess {
    name: 'ton_proof';
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
    };
}

export type TonWalletEvent = TonConnectEvent | TonDisconnectEvent

export type TonWalletMessage = TonWalletEvent | TonWalletResponse<TonRpcMethod>

export type TonWalletResponse<T extends TonRpcMethod> = TonWalletResponseSuccess<T> | TonWalletResponseError<T>

export type TonWalletResponseError<T extends TonRpcMethod> = TonRpcResponses[T]['error']

export type TonWalletResponseSuccess<T extends TonRpcMethod> = TonRpcResponses[T]['success']

export type TonWalletResponseTemplateError = {
    error: {
        code: number;
        message: string;
        data?: unknown;
    };
    id: string;
}

export type WalletResponseTemplateSuccess = {
    result: string;
    id: string;
}


export type TonManifest = {
  url: string,
  name: string,
  iconUrl: string,
  termsOfUseUrl?: string,
  privacyPolicyUrl?: string
}
// TON nft

export interface TonNftItemsResponse {
  nft_items: TonNftItem[];
  address_book: Record<string, AddressBookItem>;
  metadata: Record<string, MetadataItem>;
}

export interface BaseTonNftJson {
    name?: string;
    description?: string;
    image?: string;
    marketplace?: string,
    attributes?: Array<{
        value?: string;
        trait_type?: string;
    }>;
}

export interface TonNftItem {
  address: string;
  init: boolean;
  index: string;
  collection_address: string;
  owner_address: string;
  content: Content;
  last_transaction_lt: string;
  code_hash: string;
  data_hash: string;
  collection: Collection;
  on_sale: boolean;
}

export interface Content {
  uri: string;
}

export interface Collection {
  address: string;
  owner_address: string;
  last_transaction_lt: string;
  next_item_index: string;
  collection_content: Content;
  data_hash: string;
  code_hash: string;
}

export interface AddressBookItem {
  user_friendly: string;
  domain: string | null;
}

export interface MetadataItem {
  is_indexed: boolean;
  token_info: TokenInfo[];
}

export interface TokenInfo {
  valid: boolean;
  type: string;
  name: string;
  description: string;
  image: string;
  nft_index?: string;
  extra: Extra;
}

export interface Extra {
  _image_big?: string;
  _image_medium?: string;
  _image_small?: string;
  cover_image?: string | null;
  external_link?: string | null;
  external_url?: string | null;
  marketplace?: string;
  social_links?: string[];
  uri?: string;
  attributes?: Attribute[];
  buttons?: unknown[];
}

export interface Attribute {
  trait_type: string;
  value: string;
}
