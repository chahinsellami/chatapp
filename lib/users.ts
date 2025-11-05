export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "offline";
  lastSeen?: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    avatar: "https://i.pravatar.cc/48?img=1",
    status: "online",
  },
  {
    id: "2",
    name: "Bob Smith",
    avatar: "https://i.pravatar.cc/48?img=2",
    status: "online",
  },
  {
    id: "3",
    name: "Charlie Brown",
    avatar: "https://i.pravatar.cc/48?img=3",
    status: "away",
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "4",
    name: "Diana Prince",
    avatar: "https://i.pravatar.cc/48?img=4",
    status: "offline",
    lastSeen: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "5",
    name: "Evan Peters",
    avatar: "https://i.pravatar.cc/48?img=5",
    status: "online",
  },
];

export function getStatusColor(status: string): string {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
      return "bg-gray-400";
    default:
      return "bg-gray-300";
  }
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
