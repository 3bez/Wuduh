import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  required?: boolean;
  /** When set, shows a live character counter. */
  maxLength?: number;
}

/** Multi-line answer field — the primary input for Wuduh question cards. */
export function Textarea(props: TextareaProps): JSX.Element;
