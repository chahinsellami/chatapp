"use client";

// FriendsList removed: provide a typed stub so callers don't break.
type UserId = string;

interface LocalFriend {
  id: UserId;
  username: string;
  avatar?: string | null;
}

interface LocalRequest {
  id: string;
  username: string;
  avatar?: string | null;
  createdAt: string;
}

interface Props {
  friends?: LocalFriend[];
  onlineUsers?: Set<UserId>;
  actionLoading?: string | number | null;
  handleRemoveFriend?: (id: string) => void;
  pendingRequests?: LocalRequest[];
  expandPending?: boolean;
  setExpandPending?: (v: boolean) => void;
  handleAcceptRequest?: (id: string) => void;
  handleRejectRequest?: (id: string) => void;
  onSelectFriend?: (id: string, friend?: any) => void;
  userId?: string;
  onRefresh?: () => void;
}

export default function FriendsList(_props: Props) {
  // This component was intentionally removed. Returning null keeps imports intact
  // while removing the UI. Replace with your preferred implementation later.
  return null;
}
