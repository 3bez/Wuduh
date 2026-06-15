import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. */
  variant?: 'ghost' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  /** Fully rounded (pill/circle). */
  round?: boolean;
  /** Accessible label — required since the button is icon-only. */
  label: string;
  /** The icon node (e.g. a Lucide SVG). */
  children: React.ReactNode;
}

/** Square or round icon-only button. Always pass `label` for accessibility. */
export function IconButton(props: IconButtonProps): JSX.Element;
