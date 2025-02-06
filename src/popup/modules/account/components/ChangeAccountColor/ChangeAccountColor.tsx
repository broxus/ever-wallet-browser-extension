import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useState } from 'react'

import { Button, ColorRadioButton, Container, Content, Footer, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { useAddressColor, JDENTICON_COLORS } from '@app/popup/modules/shared/components/Jdenticon'

import styles from './ChangeAccountColor.module.scss'
import { ChangeAccountColorViewModel } from './ChangeAccountColorViewModel'

interface Props {
    account: nt.AssetsList;
}

export const ChangeAccountColor = observer(({ account }: Props): JSX.Element => {
    const intl = useIntl()
    const vm = useViewModel(ChangeAccountColorViewModel)
    const [initialColor, setAddressColor] = useAddressColor(account.tonWallet.address)
    const [color, setColor] = useState(initialColor)

    const handleSave = () => {
        setAddressColor(color)
        vm.handle.close()
    }

    const handleColorClick = (color: JDENTICON_COLORS) => {
        setColor(color)
    }

    return (
        <Container>
            <Content className={styles.content}>
                {(Object.values(JDENTICON_COLORS) as Array<JDENTICON_COLORS>).map((colorElement) => (
                    <ColorRadioButton
                        key={colorElement}
                        color={colorElement}
                        selected={color === colorElement}
                        onClick={() => handleColorClick(colorElement)}
                    />
                ))}
            </Content>

            <Footer>
                <FooterAction>
                    <Button design="accent" type="submit" onClick={handleSave}>
                        {intl.formatMessage({ id: 'SAVE_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
