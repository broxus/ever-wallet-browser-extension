/* eslint-disable react/no-array-index-key */
import { memo } from 'react'

import styles from './SeedList.module.scss'

interface Props {
    words?: string[]
}

export const SeedList = memo(({ words }: Props): JSX.Element => (
    <ol className={styles.seedList}>
        {words?.map((word: string, i: number) => (
            <li key={`${word}_${i}`} className={styles.item}>
                {word.toLowerCase()}
            </li>
        ))}
    </ol>
))
