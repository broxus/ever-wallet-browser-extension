import classNames from 'classnames'
import copy from 'copy-to-clipboard'
import { memo, useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import CopyImg from '@app/popup/assets/img/welcome/copy.svg'
import CheckImg from '@app/popup/assets/img/welcome/check-green.svg'

interface Props {
    onNext: () => void;
    onSkip: () => void;
    onBack: () => void;
    seed: string;
}

export const ExportedSeed = memo(({ onNext, onSkip, onBack, seed }: Props): JSX.Element => {
    const intl = useIntl()
    const [copied, setCopied] = useState(false)
    const words = useMemo(() => seed.split(' '), [seed])

    const handleCopy = useCallback(() => {
        copy(seed)
        setCopied(true)
    }, [seed])

    return (
        <div className="slide slide--seed active">
            <div className="container">
                <div className="slide__wrap">
                    <div className="slide__content slide__animate">
                        <h2 className="sec-title">
                            {intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' })}
                        </h2>
                        <p className="main-txt">
                            {intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE_NOTE' })}
                        </p>
                        <div className="sec-col-bar">
                            <button className="btn btn--primery btn--long" onClick={onNext}>
                                {intl.formatMessage({ id: 'CHECK_YOUR_PHRASE' })}
                            </button>
                            <div className="sec-bar">
                                <button className="btn btn--secondary" onClick={onBack}>
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </button>
                                <button className="btn btn--secondary _big" onClick={onSkip}>
                                    {intl.formatMessage({ id: 'SKIP_BTN_TEXT' })}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="slide__frame slide__animate">
                        <h2 className="slide__frame-title">
                            {intl.formatMessage({ id: 'YOUR_SEED_PHRASE' })}
                        </h2>
                        <div className="slide__frame-main">
                            <ol className="seed-list">
                                {words?.map((word: string, i: number) => (
                                    <li key={`${word}_${i.toString()}`} className="seed-list__item">
                                        {word.toLowerCase()}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="slide__frame-footer">
                            <div className="copy">
                                <button className={classNames('btn btn--ghost', { copied })} onClick={handleCopy}>
                                    <i><img src={CopyImg} alt="" /></i>
                                    <span>
                                        {intl.formatMessage({ id: 'COPY_ALL_WORDS_BTN_TEXT' })}
                                    </span>
                                </button>
                                <div className="copy__confirm">
                                    <i><img src={CheckImg} alt="" /></i>
                                    <span>
                                        {intl.formatMessage({ id: 'COPY_ALL_WORDS_SUCCESS' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
