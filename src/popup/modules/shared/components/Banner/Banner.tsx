import { memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import styles from './Banner.module.scss'
import { Button } from '../Button'

type Props = PropsWithChildren<{
    className?: string;
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonClick: () => void;
}>

export const Banner = memo(
    ({ className, title, subtitle, buttonText, onButtonClick }: Props): JSX.Element => (
        <div className={classNames(styles.banner, className)}>
            <div className={styles.content}>
                <div className={styles.content}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.subtitle}>{subtitle}</div>
                </div>
                <div>
                    <Button
                        size="s"
                        width="auto"
                        shape="pill"
                        design="transparency"
                        onClick={onButtonClick}
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
            <div className={styles.icon} />
        </div>
    ),
)
