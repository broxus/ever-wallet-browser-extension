import React from 'react'

import { ManageSeeds } from '@app/popup/components/AccountsManagement'
import { AccountabilityProvider } from '@app/popup/modules/shared/providers/AccountabilityProvider'
import { DrawerPanelProvider } from '@app/popup/modules/shared/providers/DrawerPanelProvider'


export function AccountsManagerPage(): JSX.Element {
	return (
		<DrawerPanelProvider>
			<AccountabilityProvider>
				<div className="accounts-management__page">
					<ManageSeeds />
				</div>
			</AccountabilityProvider>
		</DrawerPanelProvider>
	)
}
