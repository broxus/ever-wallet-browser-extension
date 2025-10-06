import { Configuration, GaslessApi } from 'src/generated'

const config = new Configuration({
    basePath: 'https://your-api-url.com',
})

export const gaslessApi = new GaslessApi(config)
