import { memo, useCallback, useRef, useState, PropsWithChildren } from 'react'
import classNames from 'classnames'

import DotsIcon from '@app/popup/assets/icons/dots.svg'

import { Dropdown } from '../Dropdown'
import { useOnClickOutside } from '../../hooks'

import './DropdownMenu.scss'

type Props = PropsWithChildren<{
    className?: string;
}>;

export const DropdownMenu = memo(({ className, children }: Props): JSX.Element => {
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
                {children}
            </Dropdown>
        </div>
    )
})
