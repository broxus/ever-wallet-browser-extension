import React, { memo } from 'react'

import TonLogo from '@app/popup/assets/img/ton-logo.svg'

interface Props {
    className?: string;
}

export const TonAssetIcon = memo(({ className }: Props): JSX.Element => (
    <img src={TonLogo} alt="" className={className} />
))
