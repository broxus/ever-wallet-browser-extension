import { NetworkConfig } from '@app/models'

export interface NetworkFormValue {
    name: string;
    config: NetworkConfig;
    type: 'graphql' | 'jrpc' | 'proto';
    endpoints: Array<{ value: string }>;
    local: boolean;
}
