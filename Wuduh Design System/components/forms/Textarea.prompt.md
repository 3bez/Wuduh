Multi-line answer field — the workhorse input on Wuduh question cards. Supports a live character counter via `maxLength`.

```jsx
<Textarea label="Describe your customer" value={v} onChange={e=>setV(e.target.value)}
  maxLength={400} helpText="One clear segment beats three vague ones." />
```
