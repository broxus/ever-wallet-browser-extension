import { generatePath, Params } from 'react-router-dom'

class Route<P extends Params> {

    readonly path: string

    constructor(path: string) {
        this.path = path
    }

    makeUrl(params?: P): string {
        return generatePath(this.path, params)
    }

}

export const appRoutes = {
    welcome: new Route('/'),
    newAccount: new Route('/newAccount'),
    importAccount: new Route('/importAccount'),
    ledgerSignIn: new Route('/ledgerSignIn'),

    saveSeed: new Route('saveSeed'),
    checkSeed: new Route('checkSeed'),
    createPassword: new Route('createPassword'),
    confirmation: new Route('confirmation'),
    enterSeed: new Route('enterSeed'),
    connectLedger: new Route('connectLedger'),
    selectKeys: new Route('selectKeys'),
    selectNetwork: new Route('selectNetwork'),
}
