import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { WebsiteIconViewModel } from './WebsiteIconViewModel'

import './WebsiteIcon.scss'

export const WebsiteIcon = observer(() => {
    const vm = useViewModel(WebsiteIconViewModel)

    return (
        <img
            className="website-icon noselect"
            src={vm.domainMetadata?.icon}
            alt="page"
        />
    )
})
