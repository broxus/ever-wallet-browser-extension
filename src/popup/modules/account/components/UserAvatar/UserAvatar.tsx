import React, { memo } from 'react';

interface Props {
  address: string;
  small?: boolean;
  className?: string;
}

export const UserAvatar = memo(({ address, small, className }: Props): JSX.Element => {
  const hash = address.split(':')[1];
  const size = small === true ? 24 : 36;
  const colors: string[] = [];

  for (let i = 0; i < 16; i++) {
    colors.push(
      // eslint-disable-next-line prefer-template
      '#' +
      hash[0] +
      hash[i * 4] +
      hash[i * 4 + 1] +
      hash[i * 4 + 2] +
      hash[63] +
      hash[i * 4 + 3],
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none" className={className} height={size} width={size}>
      <g clipPath="url(#user-avatar-clip)">
        <circle cx="3" cy="3" r="7" fill={colors[0]} />
        <circle cx="3" cy="13" r="7" fill={colors[4]} />
        <circle cx="3" cy="23" r="7" fill={colors[8]} />
        <circle cx="3" cy="33" r="7" fill={colors[12]} />
        <circle cx="13" cy="3" r="7" fill={colors[1]} />
        <circle cx="13" cy="13" r="7" fill={colors[5]} />
        <circle cx="13" cy="23" r="7" fill={colors[9]} />
        <circle cx="13" cy="33" r="7" fill={colors[13]} />
        <circle cx="23" cy="3" r="7" fill={colors[2]} />
        <circle cx="23" cy="13" r="7" fill={colors[6]} />
        <circle cx="23" cy="23" r="7" fill={colors[10]} />
        <circle cx="23" cy="33" r="7" fill={colors[14]} />
        <circle cx="33" cy="3" r="7" fill={colors[3]} />
        <circle cx="33" cy="13" r="7" fill={colors[7]} />
        <circle cx="33" cy="23" r="7" fill={colors[11]} />
        <circle cx="33" cy="33" r="7" fill={colors[15]} />
      </g>
      <defs>
        <clipPath id="user-avatar-clip">
          <rect width="36" height="36" rx="18" fill="#ffffff" />
        </clipPath>
      </defs>
    </svg>
  );
});
