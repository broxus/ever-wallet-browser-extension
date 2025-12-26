const SECONDS_IN_ONE_DAY = 60 * 60 * 24
const SECONDS_IN_ONE_HOUR = 60 * 60
const SECONDS_IN_ONE_MINUTE = 60

export const getTimeComponents = (timeRemaining: number) => {
    const d = Math.floor(timeRemaining / SECONDS_IN_ONE_DAY)
    const h = Math.floor((timeRemaining % SECONDS_IN_ONE_DAY) / SECONDS_IN_ONE_HOUR)
    const m = Math.floor((timeRemaining % SECONDS_IN_ONE_HOUR) / SECONDS_IN_ONE_MINUTE)
    const s = Math.floor((timeRemaining % SECONDS_IN_ONE_MINUTE))

    return { d, h, m, s }
}
