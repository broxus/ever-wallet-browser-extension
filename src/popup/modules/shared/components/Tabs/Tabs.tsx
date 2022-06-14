import classNames from 'classnames';
import React, { Children, cloneElement, FunctionComponent, memo, ReactElement } from 'react';

import './Tabs.scss';

type Props<T extends string | number> = React.PropsWithChildren<{
  className?: string;
  tab: T;
  onChange: (value: T) => void;
}>;

type TabProps = React.PropsWithChildren<{
  id: string | number,
  active: boolean;
  onClick: () => void;
}>;

function InternalTabs<T extends string | number>({ className, tab, children, onChange }: Props<T>): JSX.Element {
  return (
    <div className={classNames('tabs', className)}>
      {Children.map(children as ReactElement<TabProps>[], (child) => cloneElement(child, {
        active: tab === child.props.id,
        onClick: () => onChange(child.props.id as T),
      }))}
    </div>
  );
}

function Tab({ id, active, children, onClick }: TabProps): JSX.Element {
  const className = classNames('tabs__item', { _active: active });

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export const Tabs = memo(InternalTabs) as any as typeof InternalTabs & {
  Tab: FunctionComponent<Omit<TabProps, 'active' | 'onClick'>>;
};

Tabs.Tab = Tab as any;
