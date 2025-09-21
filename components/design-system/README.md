# Padelyzer Design System Components

Apple Human Interface Guidelines compliant components for the Padelyzer platform.

## Quick Start

```tsx
import { SettingsCard, AppleButton, AppleInput } from '@/components/design-system';

function MyComponent() {
  return (
    <SettingsCard title="Settings">
      <AppleInput 
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <AppleButton variant="primary">
        Save
      </AppleButton>
    </SettingsCard>
  );
}
```

## Component Catalog

### Layout Components
- **SettingsCard** - Content container with title and subtitle
- **SettingsRow** - Individual setting item layout
- **SettingsGroup** - Group related settings together
- **EmptyState** - Placeholder for empty content

### Form Components
- **AppleInput** - Text input with validation states
- **AppleSelect** - Dropdown select field
- **SettingsToggle** - iOS-style toggle switch

### Action Components
- **AppleButton** - Button with multiple variants
- **AppleIconButton** - Icon-only button

### Overlay Components
- **AppleModal** - Modal dialog with backdrop

## Design Principles

1. **Clarity** - Interface is clear and focused
2. **Deference** - Content is prioritized over UI
3. **Depth** - Visual layers and motion convey hierarchy

## Color System

- Primary: Green gradient (#A4DF4E to #66E7AA)
- Interactive: Blue (#007AFF)
- Destructive: Red (#FF3B30)
- Warning: Orange (#FF9500)
- Success: Green (#34C759)

## Typography

Using system font stack:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

## Contributing

When creating new components:
1. Follow Apple HIG principles
2. Ensure accessibility compliance
3. Include TypeScript types
4. Add component to this README
5. Test across different viewports

## License

Private - Padelyzer Platform