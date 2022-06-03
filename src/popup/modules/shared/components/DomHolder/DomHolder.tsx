import React, { Children, Component } from 'react';

type Props = React.PropsWithChildren<{}>;

export class DomHolder extends Component<Props> {
  static getDerivedStateFromProps(nextProps: Props) {
    const { children } = nextProps;
    let hasContent = false;

    for (const item of Children.toArray(children)) {
      if (item) {
        hasContent = true;
        break;
      }
    }

    if (hasContent) {
      return { children };
    }

    return null;
  }

  state = {
    children: null,
  };

  render() {
    const { children } = this.state;

    return children;
  }
}
