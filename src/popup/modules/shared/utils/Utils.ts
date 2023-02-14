import { Disposable, injectable } from 'tsyringe'
import { autorun, reaction, when } from 'mobx'

import { interval } from '@app/shared'

type Disposer = () => void;

@injectable()
export class Utils implements Disposable {

    private disposers: Disposer[] = []

    public dispose(): void {
        this.disposers.forEach((disposer) => disposer())
    }

    public reaction<T, FireImmediately extends boolean = false>(
        ...args: Parameters<typeof reaction<T, FireImmediately>>
    ): void {
        this.disposers.push(
            reaction(...args),
        )
    }

    public autorun(...args: Parameters<typeof autorun>): void {
        this.disposers.push(
            autorun(...args),
        )
    }

    public when(...args: Parameters<typeof when>): void {
        this.disposers.push(
            when(...args),
        )
    }

    public interval(...args: Parameters<typeof interval>): void {
        this.disposers.push(
            interval(...args),
        )
    }

}
