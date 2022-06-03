import React, { memo } from 'react';

import './Loader.scss';

export const Loader = memo((): JSX.Element => (
  <div className="loader">
    <div className="loader__item" />
    <div className="loader__item" />
    <div className="loader__item" />
    <div className="loader__item" />
  </div>
));
