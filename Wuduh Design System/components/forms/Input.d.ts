import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text below the field. */
  helpText?: string;
  /** Error message — turns the field red and replaces helpText. */
  error?: string;
  /** Shows a gold required marker next to the label. */
  required?: boolean;
  /** Leading icon node (e.g. a Lucide SVG). */
  iconStart?: React.ReactNode;
}

/** Single-line text field with label, helper/error text and optional leading icon. */
export function Input(props: InputProps): JSX.Element;
