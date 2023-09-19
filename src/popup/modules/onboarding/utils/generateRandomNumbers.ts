import { shuffleArray } from '@app/shared'

export const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(0).map((_, i) => i))
    .slice(0, 3)
    .sort((a, b) => a - b) as [number, number, number]
