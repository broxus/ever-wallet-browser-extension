import { memo } from 'react'

import LoaderIcon from '@app/popup/assets/icons/loader.svg'

import './Loader.scss'

export const Loader = memo(() => (
    <LoaderIcon className="loader" />
))
