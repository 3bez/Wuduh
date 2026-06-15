import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color tone. */
  tone?: 'neutral' | 'navy' | 'gold' | 'teal' | 'success' | 'warning' | 'danger' | 'solid';
  /** Show a leading status dot. */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Small status / category label. */
export function Badge(props: BadgeProps): JSX.Element;
