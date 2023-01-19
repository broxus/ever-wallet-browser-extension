import { NetworkConfig } from '@app/models'

export interface NetworkFormValue {
    networkId: string;
    name: string;
    config: NetworkConfig;
    type: 'graphql' | 'jrpc';
    endpoints: Array<{ value: string }>;
    local: boolean;
}
