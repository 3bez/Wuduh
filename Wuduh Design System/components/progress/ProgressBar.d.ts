import * as React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value?: number;
  /** Maximum value. Default 100. */
  max?: number;
  /** Optional label above the bar. */
  label?: string;
  /** Show a "value / max" count on the right. */
  showCount?: boolean;
  /** Fill color. Gold = overall completion. */
  tone?: 'gold' | 'teal' | 'navy';
  size?: 'md' | 'lg';
}

/** Linear completion bar — overall feasibility-study progress. */
export function ProgressBar(props: ProgressBarProps): JSX.Element;
