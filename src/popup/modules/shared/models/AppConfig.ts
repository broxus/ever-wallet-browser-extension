import type { Windows } from 'webextension-polyfill'

import type { WindowInfo } from '@app/models'
import type { ActiveTab } from '@app/popup/modules/shared'

export class AppConfig {

    constructor(
        public readonly windowInfo: WindowInfo,
        public readonly activeTab: ActiveTab,
        public readonly window: Windows.Window,
    ) {
    }

}
