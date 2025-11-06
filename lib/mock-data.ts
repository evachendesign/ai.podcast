import { Channel, User } from "@/types/dashboard";

export const mockUsers: Record<string, User> = {
  guest: {
    id: "guest",
    name: "Guest User",
    email: "guest@example.com",
  },
  john: {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    provider: "email",
  },
  jane: {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    image: "https://github.com/shadcn.png",
    provider: "google",
  },
};

export const mockChannels: Channel[] = [
  {
    id: "1",
    name: "Tech Insights",
    description: "Latest trends in technology and software development",
    episodeCount: 12,
  },
  {
    id: "2",
    name: "Startup Stories",
    description: "Inspiring journeys of successful entrepreneurs",
    episodeCount: 8,
  },
  {
    id: "3",
    name: "Design Matters",
    description: "UI/UX principles and creative design thinking",
    episodeCount: 15,
  },
  {
    id: "4",
    name: "AI Revolution",
    description: "Exploring artificial intelligence and machine learning",
    episodeCount: 20,
  },
  {
    id: "5",
    name: "Health & Wellness",
    description: "Tips and insights for a healthier lifestyle",
    episodeCount: 6,
  },
  {
    id: "6",
    name: "Finance 101",
    description: "Personal finance and investment strategies",
    episodeCount: 10,
  },
];

// Helper function to get a subset of channels
export const getChannels = (count?: number): Channel[] => {
  if (!count) return mockChannels;
  return mockChannels.slice(0, count);
};

