import classNames from 'classnames'
import {
    ChangeEvent,
    ChangeEventHandler,
    createRef,
    FocusEventHandler,
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEvent,
    MutableRefObject,
    PureComponent,
    ReactNode,
} from 'react'

import { AutoScroller } from './AutoScroller'

import './Autocomplete.scss'

interface Props {
    className?: string;
    minSearchLength: number;
    dataset: DatasetItem[];
    children: (props: {
        ref: MutableRefObject<any>;
        onKeyDown: KeyboardEventHandler;
        onChange: ChangeEventHandler;
        onFocus: FocusEventHandler;
        onBlur: FocusEventHandler;
    }) => ReactNode,
    onSearch: (value: string) => void;
    onSelect: (item: DatasetItem) => void;
}

interface State {
    value: string;
    activeIndex: number;
    opened: boolean;
}

export interface DatasetItem {
    id: string;
    label: string;
}

export class Autocomplete extends PureComponent<Props, State> {

    // eslint-disable-next-line react/static-property-placement
    static defaultProps = {
        minSearchLength: 1, // eslint-disable-line react/default-props-match-prop-types
    }

    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
        if (state.activeIndex >= props.dataset.length) {
            return {
                activeIndex: Math.max(0, props.dataset.length - 1),
            }
        }

        return null
    }

    childrenRef = createRef<any>()

    preventBlur = false

    state = {
        value: '',
        activeIndex: 0,
        opened: false,
    }

    handleChange = (e: ChangeEvent) => {
        const { minSearchLength, onSearch } = this.props
        const { value } = e.target as HTMLInputElement

        this.setState({ value, opened: true })

        if (value.trim().length >= minSearchLength) {
            onSearch(value)
        }
    }

    handleFocus = () => {
        const { minSearchLength, onSearch } = this.props
        const { value } = this.state

        this.setState({ opened: true })

        if (value.trim().length >= minSearchLength) {
            onSearch(value)
        }
    }

    handleBlur = () => {
        this.setState({ opened: false })

        if (this.preventBlur) {
            this.childrenRef.current?.focus()
            this.preventBlur = false
        }
    }

    handleKeyDown = (e: KeyboardEvent) => {
        const { dataset, minSearchLength } = this.props
        const { value, activeIndex } = this.state

        if (value.trim().length < minSearchLength) {
            return
        }

        if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Escape' || e.code === 'Enter') {
            switch (e.code) {
                case 'Escape':
                    e.preventDefault()
                    this.setState({ value: '', activeIndex: 0, opened: false })
                    break

                case 'ArrowUp':
                    e.preventDefault()

                    if (activeIndex > 0) {
                        this.setState({ activeIndex: activeIndex - 1, opened: true })
                    }
                    else {
                        this.setState({ opened: true })
                    }
                    break

                case 'ArrowDown':
                    e.preventDefault()

                    if (activeIndex < dataset.length - 1) {
                        this.setState({ activeIndex: activeIndex + 1, opened: true })
                    }
                    else {
                        this.setState({ opened: true })
                    }
                    break

                case 'Enter':
                    if (dataset[activeIndex]) {
                        this.handleItemSelect(dataset[activeIndex])
                    }
                    break

                default:
                    break
            }
        }
    }

    handleItemClick = (e: MouseEvent) => {
        const { dataset } = this.props
        const { id } = (e.currentTarget as HTMLElement).dataset
        const item = dataset.find(item => item.id === id)!

        this.preventBlur = true
        this.handleItemSelect(item)
    }

    handleItemSelect = (item: DatasetItem) => {
        const { onSelect } = this.props

        this.setState({ value: '', activeIndex: 0, opened: false })
        onSelect(item)
    }

    handleItemMouseEnter = (e: MouseEvent) => this.setState({
        activeIndex: parseInt((e.target as HTMLElement).dataset.index!, 10),
    })

    renderItems = () => {
        const { dataset, minSearchLength } = this.props
        const { value, activeIndex } = this.state

        if (value.trim().length < minSearchLength || dataset.length === 0) {
            return null
        }

        return dataset.map((item, i) => (
            <li
                role="presentation"
                key={item.id}
                data-id={item.id}
                data-index={i}
                className={classNames('autocomplete__list-item', { _focused: activeIndex === i })}
                onMouseDown={this.handleItemClick}
                onMouseEnter={this.handleItemMouseEnter}
            >
                {item.label}
            </li>
        ))
    }

    render() {
        const { className, minSearchLength, dataset, children } = this.props
        const { value, opened } = this.state
        const active = opened && value.trim().length >= minSearchLength && dataset.length > 0

        return (
            <div className={classNames('autocomplete', className, { active })}>
                {children({
                    ref: this.childrenRef,
                    onChange: this.handleChange,
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus,
                    onKeyDown: this.handleKeyDown,
                })}
                {active && (
                    <div className="autocomplete__dropdown">
                        <AutoScroller selector=".autocomplete__list-item._focused">
                            {ref => (
                                <ul className="autocomplete__list" ref={ref}>
                                    {this.renderItems()}
                                </ul>
                            )}
                        </AutoScroller>
                    </div>
                )}
            </div>
        )
    }

}
