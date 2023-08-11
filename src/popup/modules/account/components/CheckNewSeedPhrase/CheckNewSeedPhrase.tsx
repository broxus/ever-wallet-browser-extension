import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useIntl } from 'react-intl'

import { shuffleArray } from '@app/shared'
import {
    Button,
    Space,
    CheckSeedInput,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header, Navbar, Form, FormControl,
} from '@app/popup/modules/shared'

interface Props {
    words: string[];
    onSubmit(): void;
    onBack(): void;
}

const generateRandomNumbers = (length: number) => shuffleArray(new Array(length).fill(1).map((_, i) => i + 1))
    .slice(0, 4)
    .sort((a, b) => a - b)

export function CheckNewSeedPhrase({ words, onSubmit, onBack }: Props) {
    const intl = useIntl()
    const { register, handleSubmit, formState, setValue } = useForm()
    const { errors } = formState

    const numbers = useMemo(() => generateRandomNumbers(words.length), [words])
    const validateWord = useCallback((word: string, position: number) => words?.[position - 1] === word, [words])

    return (
        <Container>
            <Header>
                <Navbar back={onBack} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'CHECK_THE_SEED_PHRASE' })}</h2>
                <Form id="words" onSubmit={handleSubmit(onSubmit)}>
                    <Space direction="column" gap="s">
                        {numbers.map((item, idx) => (
                            <FormControl key={item} invalid={!!errors[`word${idx}`]}>
                                <CheckSeedInput
                                    number={item}
                                    autoFocus={idx === 0}
                                    reset={() => setValue(`word${idx}`, '')}
                                    {...register(`word${idx}`, {
                                        required: true,
                                        validate: (word: string) => validateWord(word, item),
                                    })}
                                />
                            </FormControl>
                        ))}
                        {(errors.word0 || errors.word1 || errors.word2 || errors.word3) && (
                            <ErrorMessage>
                                {intl.formatMessage({ id: 'ERROR_SEED_DOES_NOT_MATCH' })}
                            </ErrorMessage>
                        )}
                    </Space>
                </Form>
            </Content>

            <Footer>
                <Space direction="column" gap="s">
                    <Button type="submit" form="words">
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={onSubmit}>
                        {intl.formatMessage({ id: 'CREATE_SEED_SKIP_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
}
