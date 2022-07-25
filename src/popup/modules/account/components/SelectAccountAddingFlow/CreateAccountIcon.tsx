import React, { memo } from 'react'

interface Props {
    className?: string;
}

export const CreateAccountIcon = memo(({ className }: Props): JSX.Element => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M19.9122 0L11 8.91221V13H15.0878L24 4.08779L19.9122 0ZM14.319 11.4H12.6V9.68097L19.8809 2.40002L21.6 4.11907L14.319 11.4ZM4 5H3V6V20V21H4H18H19V20V15H17V19H5V7H9V5H4Z"
            fill="currentColor"
        />
    </svg>
))
