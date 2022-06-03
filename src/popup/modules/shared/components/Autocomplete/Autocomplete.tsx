import classNames from 'classnames';
import React, {
  ChangeEvent,
  ChangeEventHandler,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  PureComponent,
  ReactNode, RefObject,
} from 'react';
import { AutoScroller } from './AutoScroller';

import './Autocomplete.scss';

interface Props {
  className?: string;
  minSearchLength: number;
  dataset: DatasetItem[];
  children: (props: {
    ref: RefObject<any>;
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
  activeItemId: string;
  opened: boolean;
}

export interface DatasetItem {
  id: string;
  label: string;
}

export class Autocomplete extends PureComponent<Props, State> {
  static defaultProps = {
    minSearchLength: 1,
  };

  childrenRef = React.createRef<any>();
  preventBlur = false;

  state = {
    value: '',
    activeItemId: '',
    opened: false,
  };

  handleChange = (e: ChangeEvent) => {
    const { minSearchLength, onSearch } = this.props;
    const value = (e.target as HTMLInputElement).value;

    this.setState({ value, opened: true });

    if (value.trim().length >= minSearchLength) {
      onSearch(value);
    }
  };

  handleFocus = () => {
    const { minSearchLength, onSearch } = this.props;
    const { value } = this.state;

    this.setState({ opened: true });

    if (value.trim().length >= minSearchLength) {
      onSearch(value);
    }
  };

  handleBlur = () => {
    this.setState({ opened: false });

    if (this.preventBlur) {
      this.childrenRef.current?.focus();
    }
  };

  handleKeyDown = (e: KeyboardEvent) => {
    const { dataset, minSearchLength } = this.props;
    const { value, activeItemId } = this.state;

    if (value.trim().length < minSearchLength) {
      return;
    }

    if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'Escape' || e.code === 'Enter') {
      const activeIndex = activeItemId ? dataset.findIndex((item) => item.id === activeItemId) : -1;

      switch (e.code) {
        case 'Escape':
          e.preventDefault();
          this.setState({ value: '', activeItemId: '', opened: false });
          break;

        case 'ArrowUp':
          e.preventDefault();

          if (activeIndex > 0) {
            this.setState({ activeItemId: dataset[activeIndex - 1].id, opened: true });
          } else {
            this.setState({ opened: true });
          }
          break;

        case 'ArrowDown':
          e.preventDefault();

          if (activeIndex < dataset.length - 1) {
            this.setState({ activeItemId: dataset[activeIndex + 1].id, opened: true });
          } else {
            this.setState({ opened: true });
          }
          break;

        case 'Enter':
          const item = dataset[activeIndex];

          if (item) {
            this.handleItemSelect(item);
          }
          break;

        default:
          break;
      }
    }
  };

  handleItemClick = (e: MouseEvent) => {
    const { dataset } = this.props;
    const { id } = (e.currentTarget as HTMLElement).dataset;
    const item = dataset.find((item) => item.id === id)!;

    this.preventBlur = true;
    this.handleItemSelect(item);
  };

  handleItemSelect = (item: DatasetItem) => {
    const { onSelect } = this.props;

    this.setState({ value: '', activeItemId: '', opened: false });
    onSelect(item);
  };

  handleItemMouseEnter = (e: MouseEvent) => this.setState({
    activeItemId: (e.target as HTMLElement).dataset.id!,
  });

  handleItemMouseLeave = () => this.setState({ activeItemId: '' });

  renderItems = () => {
    const { dataset, minSearchLength } = this.props;
    const { value, activeItemId } = this.state;

    if (value.trim().length < minSearchLength || dataset.length === 0) {
      return null;
    }

    return dataset.map((item) => (
      <li
        role="presentation"
        key={item.id}
        data-id={item.id}
        className={classNames('autocomplete__list-item', { _focused: activeItemId === item.id })}
        onMouseDown={this.handleItemClick}
        onMouseEnter={this.handleItemMouseEnter}
        onMouseLeave={this.handleItemMouseLeave}
      >
        {item.label}
      </li>
    ));
  };

  render() {
    const { className, minSearchLength, dataset, children } = this.props;
    const { value, opened } = this.state;
    const active = opened && value.trim().length >= minSearchLength && dataset.length > 0;

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
              {(ref) => (
                <ul className="autocomplete__list" ref={ref}>
                  {this.renderItems()}
                </ul>
              )}
            </AutoScroller>
          </div>
        )}
      </div>
    );
  }
}
