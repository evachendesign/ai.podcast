# Dashboard Components

This folder contains all components related to the Podcast Channel Dashboard (Landing Page).

## Component Structure

### Dashboard (Main Component)
The main component that orchestrates the entire dashboard view.

**Props:**
- `initialChannels?: Channel[]` - Array of channel objects to display
- `isLoggedIn?: boolean` - Whether the user is logged in (default: false)
- `userName?: string` - User's display name
- `userImage?: string` - URL to user's profile image

**Usage:**
```tsx
import { Dashboard } from "@/components/dashboard";

<Dashboard
  initialChannels={channels}
  isLoggedIn={true}
  userName="John Doe"
  userImage="https://example.com/avatar.jpg"
/>
```

### TopBar
The navigation bar displayed at the top of the page.

**Features:**
- AI Podcast logo with icon
- Create New Channel button
- Login button (when not logged in)
- User avatar with initials or profile picture (when logged in)
- Responsive design (button text adapts to screen size)

**Props:**
- `isLoggedIn?: boolean` - Login status
- `userName?: string` - User's name for generating initials
- `userImage?: string` - Profile image URL
- `onCreateChannel?: () => void` - Callback for create channel action
- `onLogin?: () => void` - Callback for login action

### ChannelCard
Individual channel card component displaying channel information.

**Props:**
- `id: string` - Unique channel identifier
- `name: string` - Channel name
- `description?: string` - Channel description
- `episodeCount?: number` - Number of episodes (default: 0)
- `onGoToChannel?: (id: string) => void` - Navigation callback

**Features:**
- Hover effects with shadow and border animation
- Radio icon indicator
- Episode count display
- "Go to Channel" button with arrow animation

### ChannelGrid
Grid layout for displaying multiple channel cards.

**Props:**
- `channels: Channel[]` - Array of channel objects
- `onGoToChannel?: (id: string) => void` - Navigation callback

**Features:**
- Responsive grid (1-4 columns based on screen size)
- Section header with title and description
- Proper spacing and alignment

### EmptyState
Displayed when user has no channels yet.

**Props:**
- `onCreateChannel?: () => void` - Callback for create channel action

**Features:**
- Centered layout
- Decorative icon
- Clear call-to-action button
- Encouraging message

## Channel Type

```typescript
interface Channel {
  id: string;
  name: string;
  description?: string;
  episodeCount?: number;
}
```

## Design Features

- **Modern UI**: Clean, professional design using shadcn/ui components
- **Responsive**: Adapts seamlessly from mobile to desktop
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Animated**: Smooth transitions and hover effects
- **Dark Mode**: Full dark mode support through Tailwind CSS

## Color Scheme

Uses the configured shadcn theme with:
- Primary color for brand elements
- Muted colors for secondary text
- Card backgrounds with hover states
- Border animations on interaction

## Future Enhancements

To make this production-ready, implement:
1. Real authentication integration (OAuth, JWT)
2. API integration for channel data
3. Channel creation modal/form
4. Channel editing and deletion
5. Search and filter functionality
6. Pagination for large channel lists
7. Channel analytics and statistics
8. Settings and preferences

