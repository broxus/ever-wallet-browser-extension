declare module 'obj-multiplex' {
    import { Duplex } from 'readable-stream'

    type DuplexParams = { parent: string; name: string };

    declare class Substream extends Duplex {

        constructor(params: DuplexParams);

    }

    declare class ObjectMultiplex extends Duplex {

        createStream(name: string): Substream;

        ignoreStream(name: string);

    }

    export default ObjectMultiplex
}

declare module '@app/popup/assets/icons/*.svg' {
    import React from 'react'

    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
    export default ReactComponent
}

declare module '@app/popup/assets/img/*.svg' {
    const content: string
    export default content
}

declare module '*.png' {
    const content: string
    export default content
}

declare module '*.module.css' {
    const classes: { [key: string]: string }
    export default classes
}

declare module '*.module.scss' {
    const classes: { [key: string]: string }
    export default classes
}
