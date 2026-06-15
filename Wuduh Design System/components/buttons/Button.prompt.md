Primary action control — use `primary` (navy) for the main action, `accent` (gold) for the single most important moment on a view, and `secondary`/`ghost` for everything quieter.

```jsx
<Button variant="primary">Continue</Button>
<Button variant="accent" size="lg" iconEnd={<ArrowRight/>}>Export my study</Button>
<Button variant="secondary">Back</Button>
<Button variant="ghost" size="sm">Skip for now</Button>
```

Variants: `primary` · `accent` · `secondary` · `ghost` · `danger`. Sizes: `sm` · `md` · `lg`. Use `block` for full-width (mobile cards). Gold `accent` should appear at most once per screen.
