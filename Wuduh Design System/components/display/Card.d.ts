import * as React from 'react';

/**
 * Props for the core surface container.
 * @startingPoint section="Cards" subtitle="Content card with eyebrow + serif title" viewport="420x240"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `swipe` is the elevated, rounded card used in the question flow. */
  variant?: 'default' | 'raised' | 'swipe';
  /** Inner padding. Use `flush` when the card holds edge-to-edge media. */
  padding?: 'md' | 'lg' | 'flush';
  /** Mono eyebrow / category label above the title. */
  eyebrow?: React.ReactNode;
  /** Serif card title. */
  title?: React.ReactNode;
  /** Adds a 3px gold rule along the top edge. */
  accentTop?: boolean;
  /** Lifts on hover — use for clickable cards. */
  interactive?: boolean;
  children?: React.ReactNode;
}

/** Surface container — the core building block of Wuduh. */
export function Card(props: CardProps): JSX.Element;
