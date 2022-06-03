import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Carousel as ReactCarousel } from 'react-responsive-carousel';
import RightArrow from '@app/popup/assets/img/right-arrow.svg';
import LeftArrow from '@app/popup/assets/img/left-arrow.svg';

import './Carousel.scss';

type Props = React.PropsWithChildren<{
  centerMode?: boolean;
  selectedItem?: number;
  transitionTime?: number;
  onChange?(index: number): void;
}>;

export const Carousel = forwardRef<ReactCarousel, Props>((props, ref) => {
  const {
    centerMode = true,
    children,
    selectedItem = 0,
    transitionTime = 200,
    onChange,
  } = props;

  return (
    <ReactCarousel
      ref={ref}
      autoPlay={false}
      centerMode={centerMode}
      centerSlidePercentage={100}
      infiniteLoop={false}
      renderArrowNext={(clickHandler, hasNext, label) => (
        <button
          type="button"
          aria-label={label}
          className={classNames('control-arrow control-next', {
            'control-disabled': !hasNext,
          })}
          onClick={clickHandler}
        >
          <img src={RightArrow} alt="" />
        </button>
      )}
      renderArrowPrev={(clickHandler, hasPrev, label) => (
        <button
          type="button"
          aria-label={label}
          className={classNames('control-arrow control-prev', {
            'control-disabled': !hasPrev,
          })}
          onClick={clickHandler}
        >
          <img src={LeftArrow} alt="" />
        </button>
      )}
      selectedItem={selectedItem}
      showThumbs={false}
      showStatus={false}
      swipeable={false}
      transitionTime={transitionTime}
      onChange={onChange}
    >
      {children as React.ReactChild[]}
    </ReactCarousel>
  );
});
