import { Children, cloneElement, memo, PropsWithChildren, ReactElement, useCallback, useRef, useState } from 'react'
import classNames from 'classnames'

import DotsIcon from '@app/popup/assets/icons/dots.svg'

import { useOnClickOutside } from '../../hooks'
import { Dropdown } from '../Dropdown'

import './DropdownMenu.scss'

type Props = PropsWithChildren<{
    className?: string;
}>

type ItemProps = PropsWithChildren<{
    icon: JSX.Element;
    className?: string;
    disabled?: boolean;
    danger?: boolean;
    onClick(): void;
}>;

const DropdownMenuInternal = memo(({ className, children }: Props): JSX.Element => {
    const [active, setActive] = useState(false)
    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    const toggleDropdown = useCallback(() => setActive((active) => !active), [])
    const closeDropdown = useCallback(() => setActive(false), [])

    useOnClickOutside(dropdownRef, btnRef, closeDropdown)

    return (
        <div className={classNames('dropdown-menu', className)}>
            <button
                className="dropdown-menu__btn"
                type="button"
                ref={btnRef}
                onClick={toggleDropdown}
            >
                <DotsIcon />
            </button>
            <Dropdown className="dropdown-menu__dropdown" ref={dropdownRef} active={active}>
                {Children.map(children, (child) => {
                    const item = child as ReactElement<ItemProps>

                    if (!item || !('onClick' in item.props)) return child

                    return cloneElement(item, {
                        onClick: () => {
                            closeDropdown()
                            item.props.onClick()
                        },
                    })
                })}
            </Dropdown>
        </div>
    )
})

const Item = memo(({ icon, children, className, disabled, danger, onClick }: ItemProps): JSX.Element => (
    <button
        type="button"
        className={classNames('dropdown-menu__item', { _danger: danger }, className)}
        disabled={disabled}
        onClick={onClick}
    >
        <span className="dropdown-menu__item-icon">{icon}</span>
        <span className="dropdown-menu__item-content">{children}</span>
    </button>
))


export const DropdownMenu = DropdownMenuInternal as typeof DropdownMenuInternal & {
    Item: typeof Item;
}

DropdownMenu.Item = Item
