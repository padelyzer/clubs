# Apple Human Interface Guidelines - Padelyzer Style Guide

## Overview
This document outlines the Apple HIG-compliant design system implemented for Padelyzer's settings interface. All components follow Apple's design principles for clarity, deference, and depth.

## Design Tokens

### Colors
```css
/* Primary Colors */
--color-primary: linear-gradient(135deg, #A4DF4E, #66E7AA);
--color-primary-light: #66E7AA;
--color-primary-dark: #A4DF4E;

/* Semantic Colors */
--color-text-primary: #1C1C1E;
--color-text-secondary: #8E8E93;
--color-text-tertiary: #C7C7CC;
--color-text-disabled: #8E8E93;

/* System Colors */
--color-blue: #007AFF;
--color-red: #FF3B30;
--color-orange: #FF9500;
--color-green: #34C759;
--color-yellow: #FFCC00;

/* Background Colors */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F2F2F7;
--color-bg-tertiary: #E5E5EA;
--color-bg-grouped: #FAFAFA;

/* Border Colors */
--color-border-default: #E5E5EA;
--color-border-focus: #007AFF;
--color-border-error: #FF3B30;
```

### Typography
```css
/* Font Family */
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
               "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--font-size-xs: 11px;
--font-size-sm: 12px;
--font-size-md: 13px;
--font-size-base: 15px;
--font-size-lg: 17px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 28px;

/* Font Weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Letter Spacing */
--letter-spacing-tight: -0.02em;
--letter-spacing-normal: -0.01em;
```

### Spacing
```css
/* Spacing Scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

### Border Radius
```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-3xl: 20px;
--radius-full: 9999px;
```

### Shadows
```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
             0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Focus Shadows */
--shadow-focus-blue: 0 0 0 3px rgba(0, 122, 255, 0.1);
--shadow-focus-red: 0 0 0 3px rgba(255, 59, 48, 0.1);
--shadow-focus-green: 0 0 0 3px rgba(52, 199, 89, 0.1);
```

## Component Library

### 1. SettingsCard
A container component for grouping related settings with consistent styling.

**Usage:**
```tsx
<SettingsCard 
  title="Club Information"
  subtitle="Basic details about your padel club"
>
  {/* Settings content */}
</SettingsCard>
```

**Props:**
- `title`: Main heading for the card
- `subtitle`: Optional descriptive text
- `children`: Card content
- `footer`: Optional footer content
- `noPadding`: Remove default padding
- `transparent`: Make background transparent

### 2. SettingsRow
Individual setting item within a SettingsCard.

**Usage:**
```tsx
<SettingsRow
  label="Club Name"
  description="The name displayed to your members"
  action={<input />}
/>
```

**Props:**
- `label`: Setting name
- `description`: Optional helper text
- `action`: Control element (input, toggle, button)
- `icon`: Optional icon
- `disabled`: Disable the row

### 3. SettingsToggle
Apple-style toggle switch for boolean settings.

**Usage:**
```tsx
<SettingsToggle
  checked={isEnabled}
  onChange={(checked) => setIsEnabled(checked)}
  disabled={false}
/>
```

### 4. AppleButton
Primary action button with multiple variants.

**Variants:**
- `primary`: Green gradient for main actions
- `secondary`: Blue outline for secondary actions
- `ghost`: Minimal style for tertiary actions
- `danger`: Red for destructive actions

**Sizes:**
- `small`: Compact size for tight spaces
- `medium`: Default size
- `large`: Prominent actions

**Usage:**
```tsx
<AppleButton 
  variant="primary"
  size="medium"
  onClick={handleSave}
  loading={isSaving}
>
  Save Changes
</AppleButton>
```

### 5. AppleInput
Text input field with Apple styling.

**Features:**
- Focus states with colored shadows
- Error and helper text support
- Icons and suffixes
- Character count display
- Multiline support (textarea)

**Usage:**
```tsx
<AppleInput
  label="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  type="email"
  placeholder="john@example.com"
  helper="We'll never share your email"
  error={emailError}
  required
/>
```

### 6. AppleSelect
Dropdown select with custom styling.

**Usage:**
```tsx
<AppleSelect
  label="Time Zone"
  value={timezone}
  onChange={(e) => setTimezone(e.target.value)}
  options={[
    { value: 'PST', label: 'Pacific Time' },
    { value: 'EST', label: 'Eastern Time' }
  ]}
  required
/>
```

### 7. AppleModal
Modal dialog with backdrop blur.

**Sizes:**
- `small`: 400px max width
- `medium`: 600px max width
- `large`: 900px max width
- `fullscreen`: Full viewport

**Usage:**
```tsx
<AppleModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Add New Court"
  subtitle="Configure your padel court details"
  size="medium"
  footer={
    <AppleButton onClick={handleSubmit}>
      Add Court
    </AppleButton>
  }
>
  {/* Modal content */}
</AppleModal>
```

### 8. EmptyState
Placeholder for empty content areas.

**Usage:**
```tsx
<EmptyState
  icon={<Calendar />}
  title="No courts configured"
  description="Add your first padel court to get started"
  action={
    <AppleButton onClick={handleAdd}>
      Add Court
    </AppleButton>
  }
/>
```

## Design Patterns

### 1. Horizontal Tab Navigation
```tsx
const tabs = [
  { id: 'club', label: 'Club', icon: <Building2 /> },
  { id: 'courts', label: 'Canchas', icon: <Square /> },
  // ...
];

<div style={{
  display: 'flex',
  gap: '8px',
  borderBottom: '1px solid #E5E5EA',
  marginBottom: '24px'
}}>
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      style={{
        // Tab styles with gradient indicator
      }}
    >
      {tab.icon}
      {tab.label}
    </button>
  ))}
</div>
```

### 2. Form Layout
```tsx
<SettingsCard title="Form Section">
  <div style={{ display: 'grid', gap: '20px' }}>
    <AppleInput label="Field 1" />
    <AppleInput label="Field 2" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <AppleInput label="Half Width 1" />
      <AppleInput label="Half Width 2" />
    </div>
  </div>
</SettingsCard>
```

### 3. List Management
```tsx
<SettingsCard title="Items">
  {items.length === 0 ? (
    <EmptyState 
      title="No items"
      action={<AppleButton>Add Item</AppleButton>}
    />
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map(item => (
        <div key={item.id} style={{
          padding: '16px',
          backgroundColor: '#F8F8F8',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>{item.name}</span>
          <AppleIconButton 
            icon={<Trash2 />}
            variant="danger"
            onClick={() => handleDelete(item.id)}
          />
        </div>
      ))}
    </div>
  )}
</SettingsCard>
```

## Interaction States

### Focus States
All interactive elements show a colored shadow when focused:
- Blue shadow for normal inputs: `rgba(0, 122, 255, 0.1)`
- Red shadow for error states: `rgba(255, 59, 48, 0.1)`
- Green shadow for success: `rgba(52, 199, 89, 0.1)`

### Hover States
- Buttons lift with `translateY(-1px)` and increased shadow
- Ghost buttons show subtle background: `rgba(0, 0, 0, 0.05)`
- List items highlight with background color change

### Loading States
- Buttons show spinning indicator with "Cargando..." text
- Forms disable all inputs during submission
- Use skeleton loaders for content loading

### Disabled States
- Reduced opacity to 0.5-0.6
- Background changes to `#F2F2F7`
- Cursor changes to `not-allowed`
- Remove all hover effects

## Animation Guidelines

### Timing Functions
```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

### Durations
- Micro animations: 150ms (hover, focus)
- Standard transitions: 200ms (state changes)
- Complex animations: 300ms (modals, tabs)
- Page transitions: 400ms

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale */
@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet portrait */
--breakpoint-lg: 1024px;  /* Tablet landscape */
--breakpoint-xl: 1280px;  /* Desktop */
--breakpoint-2xl: 1536px; /* Large desktop */
```

### Grid Systems
```css
/* Two Column Layout */
@media (min-width: 768px) {
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Responsive Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
```

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual hierarchy
- Focus indicators are clearly visible
- Escape key closes modals

### ARIA Labels
```tsx
<button aria-label="Delete court" title="Delete court">
  <Trash2 />
</button>

<input 
  aria-label="Club name"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="club-name-error"
/>
```

### Color Contrast
- Text on light backgrounds: min 4.5:1 ratio
- Text on colored backgrounds: min 3:1 ratio
- Interactive elements: min 3:1 ratio
- Error states use multiple indicators (color + icon + text)

## Best Practices

### 1. Consistency
- Use the same component variants for similar actions
- Maintain consistent spacing throughout
- Follow established interaction patterns

### 2. Clarity
- Clear, descriptive labels
- Helpful placeholder text
- Informative error messages
- Progressive disclosure for complex forms

### 3. Performance
- Lazy load heavy components
- Debounce search inputs (300ms)
- Throttle scroll events (100ms)
- Optimize images and icons

### 4. Feedback
- Immediate visual feedback for all interactions
- Loading states for async operations
- Success/error messages with toast notifications
- Progress indicators for multi-step processes

## Implementation Examples

### Complete Settings Page
```tsx
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('club');
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ padding: '24px' }}>
      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        {tabs.map(tab => (
          <TabButton 
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '800px' }}>
        {activeTab === 'club' && <ClubSettings />}
        {activeTab === 'courts' && <CourtSettings />}
        {/* ... other tabs */}
      </div>
    </div>
  );
}
```

### Form with Validation
```tsx
function ClubSettings() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await saveSettings(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <SettingsCard title="Club Information">
      <AppleInput
        label="Club Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        error={errors.name}
        required
      />
      
      <AppleButton 
        onClick={handleSubmit}
        variant="primary"
        fullWidth
      >
        Save Changes
      </AppleButton>
    </SettingsCard>
  );
}
```

## Testing Guidelines

### Component Testing
```tsx
describe('AppleButton', () => {
  it('should render with correct variant styles', () => {
    render(<AppleButton variant="primary">Test</AppleButton>);
    // Assert gradient background
  });

  it('should show loading state', () => {
    render(<AppleButton loading>Test</AppleButton>);
    // Assert spinner is visible
  });
});
```

### Accessibility Testing
- Use axe-core for automated a11y testing
- Manual keyboard navigation testing
- Screen reader compatibility testing
- Color contrast validation

## Migration Guide

### From Old Settings to Apple HIG
1. Replace generic cards with `SettingsCard`
2. Convert form inputs to `AppleInput` components
3. Update buttons to use `AppleButton` variants
4. Implement horizontal tab navigation
5. Add proper loading and error states
6. Ensure all interactions follow Apple HIG patterns

## Resources

### Apple HIG Documentation
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

### Component Documentation
- Located in `/components/design-system/`
- Each component has inline prop documentation
- Example usage in `/app/(auth)/dashboard/settings/page.tsx`

## Version History

### v1.0.0 (Current)
- Initial Apple HIG implementation
- Core components: SettingsCard, AppleButton, AppleInput, AppleModal
- Horizontal tab navigation
- Complete settings page refactor
- Full backend integration maintained

---

This style guide is a living document and will be updated as new patterns and components are added to the design system.