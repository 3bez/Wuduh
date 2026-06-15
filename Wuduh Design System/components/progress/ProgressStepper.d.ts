import * as React from 'react';

/**
 * Props for the section stepper.
 * @startingPoint section="Progress" subtitle="Section stepper with done/current states" viewport="640x100"
 */
export interface ProgressStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ordered section labels, e.g. ["Idea","Market","Team","Finance","Risk"]. */
  steps: string[];
  /** Index of the active step (0-based). Earlier steps render as done. */
  current?: number;
}

/** Horizontal section stepper for the feasibility flow. */
export function ProgressStepper(props: ProgressStepperProps): JSX.Element;
