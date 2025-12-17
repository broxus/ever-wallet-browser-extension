import classNames from 'classnames'
import { type PropsWithChildren, type Ref } from 'react'

import Delete from '@app/popup/assets/img/delete.svg'

import './Tag.scss'

type Props = PropsWithChildren<{
    className?: string;
    ref?: Ref<HTMLDivElement>;
    onRemove?: () => void;
}>

export const Tag = (props: Props) => {
    const { className, children, onRemove, ref } = props

    return (
        <div ref={ref} className={classNames('tag', className)}>
            {children}
            {onRemove && (
                <button type="button" className="tag__button" onClick={onRemove}>
                    <img className="tag__icon" alt="delete" src={Delete} />
                </button>
            )}
        </div>
    )
}
