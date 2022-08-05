import type {
    Permission, ProviderEvent, RawPermissions, RawProviderEventData,
} from 'everscale-inpage-provider'
import browser from 'webextension-polyfill'
import isEqual from 'lodash.isequal'

import { NekotonRpcError, RpcErrorCode } from '@app/models'

import { ApprovalController } from './ApprovalController'
import { BaseConfig, BaseController, BaseState } from './BaseController'

const POSSIBLE_PERMISSIONS: { [K in Permission]: true } = {
    basic: true,
    accountInteraction: true,
}

export function validatePermission(permission: string): asserts permission is Permission {
    if (typeof (permission as any) !== 'string') {
        throw new NekotonRpcError(
            RpcErrorCode.INVALID_REQUEST,
            'Permission must be a non-empty string',
        )
    }

    if ((POSSIBLE_PERMISSIONS as any)[permission] !== true) {
        throw new NekotonRpcError(
            RpcErrorCode.INVALID_REQUEST,
            `Unknown permission "${permission}"`,
        )
    }
}

export interface PermissionsConfig extends BaseConfig {
    origin?: string;
    approvalController?: ApprovalController;
    notifyDomain?: <T extends ProviderEvent>(
        origin: string,
        payload: { method: T; params: RawProviderEventData<T> },
    ) => void;
}

export interface PermissionsState extends BaseState {
    permissions: { [origin: string]: Partial<RawPermissions> };
}

function makeDefaultState(): PermissionsState {
    return {
        permissions: {},
    }
}

export class PermissionsController extends BaseController<PermissionsConfig, PermissionsState> {

    constructor(config: PermissionsConfig, state?: PermissionsState) {
        super(config, state || makeDefaultState())
        this.initialize()

        this._handleStorageChanged = this._handleStorageChanged.bind(this)
    }

    public async initialSync() {
        try {
            let { permissions } = await browser.storage.local.get('permissions')

            if (typeof permissions !== 'object') {
                permissions = {}
            }

            this.update({ permissions })

            for (const origin of Object.keys(permissions)) {
                this.config.notifyDomain?.(origin, {
                    method: 'permissionsChanged',
                    params: { permissions: {}},
                })
            }

            this._subscribeOnStorageChanged()
        }
        catch (e: any) {
            console.warn('Failed to load permissions', e)
        }
    }

    public async changeAccount(origin: string) {
        if (!this.config.approvalController) throw new Error('[PermissionsController] ApprovalController is not provided')

        const existingPermissions = { ...this.getPermissions(origin) }
        existingPermissions.accountInteraction = await this.config.approvalController.addAndShowApprovalRequest({
            origin,
            type: 'changeAccount',
            requestData: {},
        })

        const permissions = {
            ...this.state.permissions,
            [origin]: existingPermissions,
        }

        await this._updatePermissions(permissions)

        this.config.notifyDomain?.(origin, {
            method: 'permissionsChanged',
            params: { permissions: existingPermissions },
        })
        return existingPermissions
    }

    public async requestPermissions(origin: string, permissions: Permission[]) {
        const uniquePermissions = [...new Set(permissions).values()]
        this.fixPermissions(uniquePermissions)

        let existingPermissions = this.getPermissions(origin),
            hasNewPermissions = false

        for (const permission of uniquePermissions) {
            validatePermission(permission)

            if (existingPermissions[permission] == null) {
                hasNewPermissions = true
            }
        }

        if (hasNewPermissions) {
            if (!this.config.approvalController) throw new Error('[PermissionsController] ApprovalController is not provided')

            const originPermissions: Partial<RawPermissions> = await this.config.approvalController
                .addAndShowApprovalRequest({
                    origin,
                    type: 'requestPermissions',
                    requestData: {
                        permissions: uniquePermissions,
                    },
                })

            const permissions = {
                ...this.state.permissions,
                [origin]: originPermissions,
            }

            await this._updatePermissions(permissions)

            existingPermissions = originPermissions
        }

        this.config.notifyDomain?.(origin, {
            method: 'permissionsChanged',
            params: { permissions: existingPermissions },
        })

        return existingPermissions
    }

    public getPermissions(origin: string): Partial<RawPermissions> {
        const result = this.state.permissions[origin] || {}
        for (const key of Object.keys(result)) {
            if (key === 'tonClient') {
                const descriptor = Object.getOwnPropertyDescriptor(result, key)
                if (descriptor != null) {
                    Object.defineProperty(result, 'basic', descriptor)
                }
                delete (result as any)[key]
            }
        }
        return result
    }

    public fixPermissions(permissions: Permission[]) {
        for (let i = 0; i < permissions.length; ++i) {
            if ((permissions[i] as any) === 'tonClient') {
                permissions[i] = 'basic'
            }
        }
    }

    public async removeOrigin(origin: string) {
        const permissions = { ...this.state.permissions }
        const originPermissions = permissions[origin]
        delete permissions[origin]

        await this._updatePermissions(permissions)

        if (originPermissions != null) {
            this.config.notifyDomain?.(origin, {
                method: 'permissionsChanged',
                params: { permissions: {}},
            })
        }
    }

    public async clear() {
        const { permissions } = this.state

        await this._updatePermissions({})

        for (const origin of Object.keys(permissions)) {
            this.config.notifyDomain?.(origin, {
                method: 'permissionsChanged',
                params: { permissions: {}},
            })
        }
    }

    public checkPermissions(origin: string, permissions: Permission[]) {
        const originPermissions = this.state.permissions[origin]
        if (originPermissions == null) {
            throw new NekotonRpcError(
                RpcErrorCode.INSUFFICIENT_PERMISSIONS,
                `There are no permissions for origin "${origin}"`,
            )
        }

        for (const permission of permissions) {
            if ((originPermissions as any)[permission] == null) {
                throw new NekotonRpcError(
                    RpcErrorCode.INSUFFICIENT_PERMISSIONS,
                    `Requested permission "${permission}" not found for origin ${origin}`,
                )
            }
        }
    }

    private async _updatePermissions(permissions: { [origin: string]: Partial<RawPermissions> }) {
        this._unsubscribeOnStorageChanged()
        this.update({ permissions }, true)
        await this._savePermissions()
        this._subscribeOnStorageChanged()
    }

    private _handleStorageChanged(_changes: any) {
        const changes = _changes as Record<string, browser.Storage.StorageChange>

        if (typeof changes.permissions?.newValue === 'object') {
            if (this.config.origin) {
                const current = this.state.permissions[this.config.origin] ?? {}
                const next = changes.permissions.newValue[this.config.origin] ?? {}

                if (!isEqual(current, next)) {
                    this.config.notifyDomain?.(this.config.origin, {
                        method: 'permissionsChanged',
                        params: { permissions: next },
                    })
                }
            }

            this.update({ permissions: changes.permissions.newValue }, true)
        }
    }

    private _subscribeOnStorageChanged() {
        browser.storage.local.onChanged.addListener(this._handleStorageChanged)
    }

    private _unsubscribeOnStorageChanged() {
        browser.storage.local.onChanged.removeListener(this._handleStorageChanged)
    }

    private async _savePermissions(): Promise<void> {
        await browser.storage.local.set({ permissions: this.state.permissions })
    }

}
