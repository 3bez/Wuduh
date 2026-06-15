import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name — used for initials fallback and tooltip. */
  name?: string;
  /** Image URL. Falls back to initials when absent. */
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'navy' | 'gold' | 'teal';
  /** Rounded-square instead of circle. */
  square?: boolean;
}

/** User / founder avatar with image or initials fallback. */
export function Avatar(props: AvatarProps): JSX.Element;
