import classNames from 'classnames'
import { memo } from 'react'

interface Props {
    className?: string;
}

export const ExternalAccountIcon = memo(({ className }: Props): JSX.Element => {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={classNames(className, 'hover-stoke')}
        >
            <path
                d="M17 4L10 11M17 4V8M17 4H13M15 11V17H4V6H10"
                stroke="currentColor"
                strokeWidth="1.6"
            />
        </svg>
    )
})
