// This file contains mock user data for our chat application
// In a real app, this would come from a database

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to user's profile picture
  status: "online" | "offline" | "away"; // User's current status
  lastSeen?: string; // ISO timestamp of last activity
}

// Mock users - in production these would be fetched from a database
export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    status: "online",
  },
  {
    id: "user-2",
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    status: "online",
  },
  {
    id: "user-3",
    name: "Carol White",
    email: "carol@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol",
    status: "away",
  },
  {
    id: "user-4",
    name: "David Brown",
    email: "david@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    status: "offline",
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: "user-5",
    name: "Eve Davis",
    email: "eve@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eve",
    status: "online",
  },
];

// Helper function to get a user by ID
export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}

// Helper function to get status color
export function getStatusColor(status: User["status"]): string {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-400";
  }
}
