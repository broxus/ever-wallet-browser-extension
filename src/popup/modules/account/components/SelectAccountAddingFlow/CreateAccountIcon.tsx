import { memo } from 'react'

interface Props {
    className?: string;
}

export const CreateAccountIcon = memo(({ className }: Props): JSX.Element => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className={className}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10 0H8V8H0V10H8V18H10V10H18V8H10V0Z"
            fill="currentColor"
        />
    </svg>
))
