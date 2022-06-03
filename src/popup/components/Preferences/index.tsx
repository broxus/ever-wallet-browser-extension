import React from 'react'
import { NATIVE_CURRENCY } from '@shared/constants'
import { selectStyles } from '@app/popup/constants/selectStyle'
import * as nt from '@nekoton'

import Select from 'react-select'
import Input from '@app/popup/components/Input'
import Button from '../../modules/shared/components/Button'
import UserAvatar from '@app/popup/components/UserAvatar'

import './send.scss'

const options = [
    { value: '1', label: 'USDT' },
    { value: '60', label: NATIVE_CURRENCY },
    { value: '60', label: 'BTC' },
    { value: '60', label: 'ETH' },
]

interface IAddNewToken {
    account: nt.AssetsList
    onReturn: () => void
}

const Send: React.FC<IAddNewToken> = ({ account, onReturn }) => {
    // const [token, setToken] = useState<{ value: string; label: string } | null>([])
    return (
        <>
            <div className="send-screen__account_details">
                <UserAvatar address={account.tonWallet.address} />{' '}
                <span className="send-screen__account_details-title">Account 1</span>
            </div>

            <h2 className="send-screen__form-title">Enter receiver address</h2>
            <Select
                className="send-screen__form-token-dropdown"
                options={options}
                placeholder={'USDT'}
                styles={selectStyles}
                // onChange={(token) => {
                //     setToken(token)
                // }}
            />
            <Input autoComplete="off" placeholder={'Amount...'} />
            <div className="send-screen__form-balance">Your balance: 1,100.00 USDT</div>
            <Input autoComplete="off" placeholder={'Receiver address...'} />
            <Input autoComplete="off" className="send-screen__form-comment" placeholder={'Comment...'} />
            <div style={{ display: 'flex' }}>
                <div style={{ width: '50%', marginRight: '12px' }}>
                    <Button text={'Back'} onClick={onReturn} design="secondary" />
                </div>
                <Button text={'Send'} />
            </div>
        </>
    )
}

export default Send
