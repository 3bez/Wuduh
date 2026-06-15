import * as React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text beside the box. */
  label?: React.ReactNode;
  /** Round the box (use for single-select / radio-style lists). */
  round?: boolean;
}

/** Checkbox with the Wuduh check glyph. Pass `round` for radio-style option lists. */
export function Checkbox(props: CheckboxProps): JSX.Element;
