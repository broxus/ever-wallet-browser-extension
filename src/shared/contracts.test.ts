import { describe, it, expect, beforeEach } from 'vitest';
import type * as nt from '@broxus/ever-wallet-wasm';
import {
    requiresSeparateDeploy,
    supportedByLedger,
    getContractName,
    getContractTypes,
    getDefaultContractType,
    getDefaultWalletContracts,
    getOtherWalletContracts,
    getWalletContracts,
} from './contracts';
import type { ConnectionConfig, NetworkGroup } from './config';

describe('contracts utilities', () => {
    let mockConfig: ConnectionConfig;

    beforeEach(() => {
        // Create a minimal mock config for testing
        mockConfig = {
            defaultBlockhainSettings: {
                separateDeployWalletTypes: ['Multisig2', 'Multisig2_1'] as nt.ContractType[],
                unsupportedByLedger: ['HighloadWalletV2'] as nt.ContractType[],
                walletDefaultAccountNames: {
                    EverWallet: 'Ever Wallet',
                    Multisig2: 'Multisig 2.0',
                    Multisig2_1: 'Multisig 2.1',
                    WalletV3: 'Wallet V3',
                    WalletV3R1: 'Wallet V3 R1',
                    WalletV3R2: 'Wallet V3 R2',
                    WalletV4R1: 'Wallet V4 R1',
                    WalletV4R2: 'Wallet V4 R2',
                    WalletV5R1: 'Wallet V5 R1',
                    SurfWallet: 'Surf Wallet',
                    SafeMultisigWallet: 'Safe Multisig',
                    SafeMultisigWallet24h: 'Safe Multisig 24h',
                    SetcodeMultisigWallet: 'Setcode Multisig',
                    SetcodeMultisigWallet24h: 'Setcode Multisig 24h',
                    BridgeMultisigWallet: 'Bridge Multisig',
                    HighloadWalletV2: 'Highload V2',
                },
            },
            blockchainsByGroup: {
                mainnet: {
                    defaultWalletType: 'EverWallet' as nt.ContractType,
                    availableWalletTypes: [
                        { type: 'EverWallet' as nt.ContractType, isDeprecated: false },
                        { type: 'WalletV4R2' as nt.ContractType, isDeprecated: false },
                        { type: 'Multisig2' as nt.ContractType, isDeprecated: true },
                    ],
                    walletDefaultAccountNames: {
                        EverWallet: 'Main Wallet',
                    },
                },
                testnet: {
                    defaultWalletType: 'WalletV3' as nt.ContractType,
                    availableWalletTypes: [
                        { type: 'WalletV3' as nt.ContractType, isDeprecated: false },
                        { type: 'WalletV4R1' as nt.ContractType, isDeprecated: false },
                    ],
                },
            },
        } as unknown as ConnectionConfig;
    });

    describe('requiresSeparateDeploy', () => {
        it('should return true for wallets requiring separate deploy', () => {
            const result = requiresSeparateDeploy('Multisig2' as nt.ContractType, mockConfig);
            expect(result).toBe(true);
        });

        it('should return false for wallets with auto-deploy', () => {
            const result = requiresSeparateDeploy('EverWallet' as nt.ContractType, mockConfig);
            expect(result).toBe(false);
        });

        it('should return true for null contract type', () => {
            const result = requiresSeparateDeploy(null, mockConfig);
            expect(result).toBe(true);
        });

        it('should return true for undefined contract type', () => {
            const result = requiresSeparateDeploy(undefined, mockConfig);
            expect(result).toBe(true);
        });
    });

    describe('supportedByLedger', () => {
        it('should return true for Ledger-supported wallets', () => {
            const result = supportedByLedger('EverWallet' as nt.ContractType, mockConfig);
            expect(result).toBe(true);
        });

        it('should return false for unsupported wallets', () => {
            const result = supportedByLedger('HighloadWalletV2' as nt.ContractType, mockConfig);
            expect(result).toBe(false);
        });

        it('should return true for null contract type', () => {
            const result = supportedByLedger(null, mockConfig);
            expect(result).toBe(true);
        });

        it('should return true for undefined contract type', () => {
            const result = supportedByLedger(undefined, mockConfig);
            expect(result).toBe(true);
        });
    });

    describe('getContractName', () => {
        it('should return group-specific name when available', () => {
            const name = getContractName('EverWallet' as nt.ContractType, 'mainnet' as NetworkGroup, mockConfig);
            expect(name).toBe('Main Wallet');
        });

        it('should fallback to default name when group-specific not available', () => {
            const name = getContractName('WalletV4R2' as nt.ContractType, 'mainnet' as NetworkGroup, mockConfig);
            expect(name).toBe('Wallet V4 R2');
        });

        it('should return default name for testnet', () => {
            const name = getContractName('WalletV3' as nt.ContractType, 'testnet' as NetworkGroup, mockConfig);
            expect(name).toBe('Wallet V3');
        });
    });

    describe('getContractTypes', () => {
        it('should return all available contract types', () => {
            const types = getContractTypes(mockConfig);
            expect(types).toBeInstanceOf(Array);
            expect(types.length).toBeGreaterThan(0);
            expect(types).toContain('EverWallet');
            expect(types).toContain('Multisig2');
        });
    });

    describe('getDefaultContractType', () => {
        it('should return correct default type for mainnet', () => {
            const type = getDefaultContractType('mainnet' as NetworkGroup, mockConfig);
            expect(type).toBe('EverWallet');
        });

        it('should return correct default type for testnet', () => {
            const type = getDefaultContractType('testnet' as NetworkGroup, mockConfig);
            expect(type).toBe('WalletV3');
        });
    });

    describe('getDefaultWalletContracts', () => {
        it('should return only non-deprecated wallet types', () => {
            const contracts = getDefaultWalletContracts('mainnet' as NetworkGroup, mockConfig);

            expect(contracts).toBeInstanceOf(Array);
            expect(contracts.length).toBe(2); // EverWallet and WalletV4R2

            const types = contracts.map((c) => c.type);
            expect(types).toContain('EverWallet');
            expect(types).toContain('WalletV4R2');
            expect(types).not.toContain('Multisig2'); // deprecated
        });

        it('should include description for each contract', () => {
            const contracts = getDefaultWalletContracts('mainnet' as NetworkGroup, mockConfig);

            contracts.forEach((contract) => {
                expect(contract).toHaveProperty('type');
                expect(contract).toHaveProperty('description');
                expect(contract.description).toMatch(/CONTRACT_DESCRIPTION_/);
            });
        });
    });

    describe('getOtherWalletContracts', () => {
        it('should return only deprecated wallet types', () => {
            const contracts = getOtherWalletContracts('mainnet' as NetworkGroup, mockConfig);

            expect(contracts).toBeInstanceOf(Array);
            expect(contracts.length).toBe(1); // Only Multisig2

            expect(contracts[0].type).toBe('Multisig2');
            expect(contracts[0].description).toBe('CONTRACT_DESCRIPTION_MULTISIG2');
        });

        it('should return empty array when no deprecated contracts', () => {
            const contracts = getOtherWalletContracts('testnet' as NetworkGroup, mockConfig);
            expect(contracts).toBeInstanceOf(Array);
            expect(contracts.length).toBe(0);
        });
    });

    describe('getWalletContracts', () => {
        it('should return all wallet types (deprecated and non-deprecated)', () => {
            const contracts = getWalletContracts('mainnet' as NetworkGroup, mockConfig);

            expect(contracts).toBeInstanceOf(Array);
            expect(contracts.length).toBe(3); // All 3 types

            const types = contracts.map((c) => c.type);
            expect(types).toContain('EverWallet');
            expect(types).toContain('WalletV4R2');
            expect(types).toContain('Multisig2');
        });

        it('should include descriptions for all contracts', () => {
            const contracts = getWalletContracts('mainnet' as NetworkGroup, mockConfig);

            contracts.forEach((contract) => {
                expect(contract).toHaveProperty('type');
                expect(contract).toHaveProperty('description');
                expect(typeof contract.description).toBe('string');
            });
        });
    });
});
