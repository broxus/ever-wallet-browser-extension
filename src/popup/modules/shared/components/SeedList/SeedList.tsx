/* eslint-disable react/no-array-index-key */
import React, { memo } from 'react'

import './SeedList.scss'

interface Props {
    words?: string[]
}

export const SeedList = memo(({ words }: Props): JSX.Element => (
    <ol className="seed-list">
        {words?.map((word: string, i: number) => (
            <li key={`${word}_${i}`} className="seed-list__item">
                {word.toLowerCase()}
            </li>
        ))}
    </ol>
))
