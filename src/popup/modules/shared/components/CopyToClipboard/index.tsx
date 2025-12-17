import { type ReactElement, type MouseEvent, cloneElement, Children, useCallback } from 'react'
import type React from 'react'
import copy from 'copy-to-clipboard'

interface Options {
  debug?: boolean;
  message?: string;
  format?: string; // MIME type
  onCopy?: (clipboardData: object) => void;
}

interface CopyToClipboardProps {
  text: string;
  onCopy?: (text: string, result: boolean) => void;
  options?: Options;
  children: ReactElement<any, any>;
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
    text,
    onCopy,
    options,
    children,
    ...rest
}) => {
    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            const result = copy(text, options)

            if (onCopy) {
                onCopy(text, result)
            }

            const child = Children.only(children)
            if (child.props.onClick) {
                child.props.onClick(event)
            }
        },
        [text, onCopy, options, children],
    )

    const child = Children.only(children)

    return cloneElement(child, {
        ...rest,
        onClick: handleClick,
    })
}
