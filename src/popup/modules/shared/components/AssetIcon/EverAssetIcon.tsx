import React, { memo } from 'react'

import EverLogo from '@app/popup/assets/img/ever-logo.svg'

interface Props {
    className?: string;
}

export const EverAssetIcon = memo(({ className }: Props): JSX.Element => (
    <img src={EverLogo} alt="" className={className} />
))
