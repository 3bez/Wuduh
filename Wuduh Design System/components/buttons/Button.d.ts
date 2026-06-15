import * as React from 'react';

/**
 * Props for the primary action button.
 * @startingPoint section="Buttons" subtitle="Navy/gold/outline action button" viewport="320x80"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `accent` (gold) is reserved for the single most important action on a view. */
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to full container width. */
  block?: boolean;
  /** Icon node rendered before the label (e.g. a Lucide SVG). */
  iconStart?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconEnd?: React.ReactNode;
  /** Render as a different element, e.g. `'a'` for links. */
  as?: any;
  children?: React.ReactNode;
}

/** Primary action button for Wuduh. */
export function Button(props: ButtonProps): JSX.Element;
