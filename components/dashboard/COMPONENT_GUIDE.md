# Dashboard Component Visual Guide

## Component Hierarchy

```
Dashboard (Main Container)
│
├── TopBar
│   ├── Logo (AI Podcast + Radio Icon)
│   ├── Create New Channel Button
│   └── Login Button / User Avatar
│
└── Main Content (Conditional)
    │
    ├── EmptyState (when channels.length === 0)
    │   ├── Radio Icon (decorative)
    │   ├── "No channels yet" heading
    │   ├── "Create your personalized..." text
    │   └── Create First Channel Button
    │
    └── ChannelGrid (when channels.length > 0)
        ├── Section Header
        │   ├── "Your Channels" title
        │   └── Description text
        │
        └── Grid Container (Responsive)
            └── ChannelCard (repeated for each channel)
                ├── Card Header
                │   ├── Radio Icon (in colored circle)
                │   ├── Channel Name
                │   └── Channel Description
                ├── Card Content
                │   └── Episode Count
                └── Card Footer
                    └── Go to Channel Button
```

## Component Props Overview

### Dashboard
```typescript
interface DashboardProps {
  initialChannels?: Channel[];  // Array of channels to display
  isLoggedIn?: boolean;          // User authentication state
  userName?: string;             // User's display name
  userImage?: string;            // URL to profile picture
}
```

### TopBar
```typescript
interface TopBarProps {
  isLoggedIn?: boolean;
  userName?: string;
  userImage?: string;
  onCreateChannel?: () => void;
  onLogin?: () => void;
}
```

### ChannelCard
```typescript
interface ChannelCardProps {
  id: string;
  name: string;
  description?: string;
  episodeCount?: number;
  onGoToChannel?: (id: string) => void;
}
```

### ChannelGrid
```typescript
interface ChannelGridProps {
  channels: Channel[];
  onGoToChannel?: (id: string) => void;
}
```

### EmptyState
```typescript
interface EmptyStateProps {
  onCreateChannel?: () => void;
}
```

## Visual States

### State 1: Not Logged In, No Channels
```
┌─────────────────────────────────────────────────┐
│ 📻 AI Podcast    [+ Create New Channel] [Log In] │
├─────────────────────────────────────────────────┤
│                                                  │
│                    📻                            │
│                                                  │
│              No channels yet                     │
│    Create your personalized channel to listen to │
│                                                  │
│        [+ Create Your First Channel]             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### State 2: Logged In, No Channels
```
┌─────────────────────────────────────────────────┐
│ 📻 AI Podcast    [+ Create New Channel]    [JD] │
├─────────────────────────────────────────────────┤
│                                                  │
│                    📻                            │
│                                                  │
│              No channels yet                     │
│    Create your personalized channel to listen to │
│                                                  │
│        [+ Create Your First Channel]             │
│                                                  │
└─────────────────────────────────────────────────┘
```

### State 3: Logged In, With Channels
```
┌─────────────────────────────────────────────────────────────────┐
│ 📻 AI Podcast         [+ Create New Channel]            [JD]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your Channels                                                   │
│  Manage and listen to your personalized podcast channels        │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ 📻           │ │ 📻           │ │ 📻           │           │
│  │ Tech Insights│ │Startup Stories│ │Design Matters│           │
│  │              │ │              │ │              │           │
│  │ Latest trends│ │ Inspiring... │ │ UI/UX prin...│           │
│  │              │ │              │ │              │           │
│  │ 12 episodes  │ │ 8 episodes   │ │ 15 episodes  │           │
│  │              │ │              │ │              │           │
│  │[Go to Channel│ │[Go to Channel│ │[Go to Channel│           │
│  │      →]      │ │      →]      │ │      →]      │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 640px)
- 1 column grid
- Button text shortened ("Create" instead of "Create New Channel")
- Cards stack vertically

### Tablet (640px - 1024px)
- 2 column grid
- Full button text
- Comfortable spacing

### Desktop (1024px - 1280px)
- 3 column grid
- Optimal card size
- Enhanced hover effects

### Large Desktop (> 1280px)
- 4 column grid
- Maximum width container
- Spacious layout

## Interaction States

### Buttons
- **Default**: Primary color background
- **Hover**: Slightly darker, smooth transition
- **Focus**: Ring outline for accessibility
- **Active**: Pressed state
- **Disabled**: Reduced opacity, no pointer events

### Cards
- **Default**: White background with border
- **Hover**: Shadow increase, border color change to primary
- **Focus**: Keyboard navigation support

### Avatar
- **With Image**: Display user's profile picture
- **Without Image**: Show initials in colored circle
- **Fallback**: Single letter "U" if no name provided

## Color Usage

### Primary Elements
- **Logo Icon**: Primary color
- **Primary Buttons**: Primary background with white text
- **Icon Backgrounds**: Primary/10 (10% opacity)

### Secondary Elements
- **Outline Buttons**: Border with background hover
- **Card Borders**: Border color (muted)
- **Text**: Foreground color

### Muted Elements
- **Descriptions**: Muted foreground
- **Episode Count**: Muted foreground
- **Section Descriptions**: Muted foreground

## Animations

### Hover Effects
- **Cards**: 
  - Shadow: `transition-all` with `hover:shadow-lg`
  - Border: Changes to `primary/50`
  
- **Buttons**:
  - Background opacity changes
  - Arrow icon shifts right (gap increases)

### Transitions
- All transitions use Tailwind's default timing
- Smooth, professional feel
- Not overly animated

## Accessibility Features

✅ **Keyboard Navigation**
- All interactive elements focusable
- Clear focus indicators
- Logical tab order

✅ **Screen Readers**
- Semantic HTML
- Proper ARIA labels
- Descriptive alt text

✅ **Color Contrast**
- WCAG AA compliant
- Dark mode support
- Readable text sizes

✅ **Touch Targets**
- Minimum 44x44px
- Adequate spacing
- Mobile-friendly

## Dark Mode

All components support dark mode automatically through CSS variables:

### Light Mode Colors
- Background: White
- Text: Dark slate
- Cards: White with subtle border
- Primary: Defined in theme

### Dark Mode Colors
- Background: Dark slate
- Text: Light gray
- Cards: Slightly lighter than background
- Primary: Adjusted for contrast

## Component Communication

```typescript
// Dashboard handles all state and callbacks
Dashboard
  ↓ passes props
TopBar (receives onCreateChannel, onLogin)
  ↓ user clicks
Dashboard receives callback
  ↓ handles action
Update state / Navigate / Open modal

Dashboard
  ↓ passes props
ChannelGrid → ChannelCard (receives onGoToChannel)
  ↓ user clicks
Dashboard receives callback with channel ID
  ↓ handles navigation
Navigate to channel page
```

## Best Practices

1. **Keep components pure** - All UI logic separated from business logic
2. **Use TypeScript** - Full type safety for props and callbacks
3. **Responsive design** - Mobile-first approach
4. **Accessibility** - WCAG guidelines followed
5. **Performance** - Memoization where needed
6. **Maintainability** - Clear component boundaries
7. **Testability** - Pure functions, clear props

## Testing Checklist

When implementing:
- [ ] Test all responsive breakpoints
- [ ] Verify dark mode
- [ ] Check keyboard navigation
- [ ] Test with screen reader
- [ ] Verify touch targets on mobile
- [ ] Test empty state
- [ ] Test with 1, 3, 6, 12+ channels
- [ ] Check loading states (to be implemented)
- [ ] Verify error states (to be implemented)

