/* eslint-disable no-nested-ternary */
import { memo } from 'react'

import './ParamsView.scss'

interface Props {
    params: Object;
}

export const ParamsView = memo(({ params }: Props): JSX.Element => (
    <>
        {Object.entries(params).map(([key, value]) => (
            <div className="params-view" key={key}>
                <div className="params-view__name">{key}</div>
                <div className="params-view__value">
                    {value instanceof Array ? (
                        <pre>{JSON.stringify(value, undefined, 2)}</pre>
                    ) : (value === null || value === undefined) ? (
                        JSON.stringify(value)
                    ) : typeof value === 'object' ? (
                        <ParamsView params={value} />
                    ) : (
                        value.toString()
                    )}
                </div>
            </div>
        ))}
    </>
))
