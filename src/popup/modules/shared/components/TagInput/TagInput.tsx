/* eslint-disable react/no-array-index-key */
import classNames from 'classnames';
import React, {
  ChangeEvent,
  ChangeEventHandler,
  ClipboardEvent,
  FocusEvent,
  FocusEventHandler,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEvent,
  PureComponent,
} from 'react';
import { Tag } from '../Tag';

import './TagInput.scss';

interface Props {
  className?: string;
  validator?: (value: string) => boolean;
  submitKeys: string[];
  value: string[];
  onChange: (words: string[]) => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  onInputChange?: ChangeEventHandler<HTMLInputElement>;
}

interface State {
  inputValue: string;
  inputFocused: boolean;
  prevValue: string[];
}

export class TagInput extends PureComponent<Props, State> {
  static defaultProps = {
    submitKeys: ['Enter', ',', ' '],
  };

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (state.prevValue !== props.value) {
      return {
        prevValue: props.value,
        inputValue: '',
      };
    }

    return null;
  }

  input = React.createRef<HTMLInputElement>();
  inputMirror = React.createRef<HTMLSpanElement>();

  state: State = {
    inputValue: '',
    inputFocused: false,
    prevValue: [],
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    const { inputValue } = this.state;

    if (inputValue !== prevState.inputValue) {
      if (this.inputMirror.current && this.input.current) {
        const width = this.inputMirror.current.clientWidth;
        this.input.current.style.width = `${width || 5}px`;
      }
    }
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  focus = () => {
    this.input.current?.focus();
  };

  clearInput = () => {
    this.setState({ inputValue: '' });

    // onInputChange workaround
    if (this.input.current) {
      const input = this.input.current;
      // @ts-ignore
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  addTag = (tag: string): boolean => {
    const { value } = this.props;

    if (!tag || !this.validate(tag)) return false;

    this.handleChange([...value, tag]);
    this.clearInput();

    return true;
  };

  validate = (tag: string) => {
    const { validator } = this.props;

    if (!validator) return true;

    return validator(tag);
  };

  removeTag = (index: number) => {
    const { value } = this.props;
    const newValue = [...value.slice(0, index), ...value.slice(index + 1)];

    this.handleChange(newValue);
  };

  handleChange = (value: string[]) => {
    const { onChange } = this.props;

    onChange?.(value);
  };

  handleInputPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const { value } = this.props;
    const text = e.clipboardData.getData('text');
    const words = text.split(/[, ;\r\n\t]+/g);
    const valid = words.filter((word) => this.validate(word));

    if (valid.length > 0) {
      e.preventDefault();

      this.handleChange([...value, ...valid]);
      this.clearInput();
    }
  };

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onInputChange } = this.props;

    this.setState({ inputValue: e.target.value });

    onInputChange?.(e);
  };

  handleInputContainerClick = (e: MouseEvent) => {
    e.stopPropagation();

    this.input.current?.focus();
  };

  handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const { value, submitKeys, onKeyDown } = this.props;
    const { inputValue } = this.state;

    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      this.removeTag(value.length - 1);
    } else if (submitKeys.includes(e.key)) {
      e.preventDefault();

      const added = this.addTag((e.target as HTMLInputElement).value);

      if (!added) {
        onKeyDown?.(e);
      }
    } else {
      onKeyDown?.(e);
    }
  };

  handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    const { onFocus } = this.props;

    this.setState({ inputFocused: true });
    onFocus?.(e);
  };

  handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { onBlur } = this.props;

    this.setState({ inputFocused: false });
    onBlur?.(e);
  };

  render() {
    const { className, value } = this.props;
    const { inputValue, inputFocused } = this.state;

    return (
      <div className={classNames('tag-input', className, { _focused: inputFocused })}>
        <div className="tag-input__wrap">
          {value.map((tag, i) => (
            <Tag
              className="tag-input__tag"
              key={i.toString()}
              onRemove={() => this.removeTag(i)}
            >
              <span className="tag_input__label">{tag}</span>
            </Tag>
          ))}
          <div className="tag-input__container" onClick={this.handleInputContainerClick}>
            <input
              className="tag-input__inner"
              type="text"
              autoComplete="off"
              ref={this.input}
              value={inputValue}
              onPaste={this.handleInputPaste}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
            />
            <span ref={this.inputMirror} className="tag-input__mirror">
              {inputValue || '\u00A0'}
            </span>
          </div>
        </div>
      </div>
    );
  }
}
