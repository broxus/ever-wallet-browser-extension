import { ImgHTMLAttributes, memo } from 'react'
import classNames from 'classnames'

import styles from './NftImg.module.scss'

type Props = ImgHTMLAttributes<HTMLImageElement>

export const NftImg = memo((props: Props): JSX.Element => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
        {...props}
        className={classNames(styles.img, props.className)}
        onError={onError}
        onLoad={onLoad}
    />
))

function onError(e: { currentTarget: HTMLImageElement }): void {
    e.currentTarget.style.display = 'none'
}

function onLoad(e: { currentTarget: HTMLImageElement }): void {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    if ((width > 0 && width <= 64) || (height > 0 && height <= 64)) {
        e.currentTarget.style.imageRendering = 'pixelated'
    }
}
