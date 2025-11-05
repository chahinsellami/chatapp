"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, UserMinus, Check, X, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

interface PendingRequest {
  id: string;
  senderId: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

interface FriendsListProps {
  userId: string;
  onSelectFriend?: (friendId: string, friendData?: Friend) => void;
  onRefresh?: () => void;
}

export default function FriendsList({ userId, onSelectFriend, onRefresh }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandPending, setExpandPending] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { onlineUsers } = useSocket(userId);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }
      const res = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching friends");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`/api/friends/requests/${requestId}?action=accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to accept request");
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error accepting request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`/api/friends/requests/${requestId}?action=reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to reject request");
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Remove this friend?")) return;
    try {
      setActionLoading(friendId);
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove friend");
      await fetchFriends();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing friend");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <motion.div className="flex-1 flex items-center justify-center glass-card m-2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className="text-center">
          <motion.div className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #f97316)" }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Users className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-neutral-300">Loading friends...</p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex-1 flex flex-col glass-card m-2 relative overflow-hidden" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5" />
      <motion.div className="flex items-center gap-3 p-6 border-b border-white/10 backdrop-blur-sm bg-white/5 relative z-10" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <motion.div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #f97316)" }} whileHover={{ scale: 1.05 }}>
          <Users className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h2 className="text-white font-bold text-lg">Friends</h2>
          <p className="text-neutral-400 text-sm">{friends.length} friend{friends.length !== 1 ? "s" : ""}</p>
        </div>
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.div className="mx-6 mt-4 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm relative z-10" style={{ background: "rgba(220, 38, 38, 0.1)" }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {pendingRequests.length > 0 && (
        <motion.div className="border-b border-white/10 relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <motion.button onClick={() => setExpandPending(!expandPending)} className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors flex items-center gap-3 group" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <motion.div animate={{ rotate: expandPending ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {expandPending ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </motion.div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium text-sm">Pending Requests</span>
              <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #a855f7, #f97316)", color: "white" }}>{pendingRequests.length}</span>
            </div>
          </motion.button>
          <AnimatePresence>
            {expandPending && (
              <motion.div className="px-6 pb-4 space-y-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                {pendingRequests.map((request, index) => (
                  <motion.div key={request.id} className="p-4 rounded-xl glass-card hover:bg-white/5 transition-colors" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }} whileHover={{ scale: 1.05 }}>
                        {request.avatar?.startsWith("/avatars/") ? (
                          <img src={request.avatar} alt={request.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-bold">{request.avatar || request.username[0].toUpperCase()}</span>
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{request.username}</p>
                        <p className="text-neutral-400 text-xs">Sent {new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button onClick={() => handleAcceptRequest(request.id)} disabled={actionLoading === request.id} className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <div className="flex items-center justify-center gap-2">
                          {actionLoading === request.id ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <><Check className="w-4 h-4" />Accept</>}
                        </div>
                      </motion.button>
                      <motion.button onClick={() => handleRejectRequest(request.id)} disabled={actionLoading === request.id} className="flex-1 py-2 px-4 rounded-lg font-medium text-white text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <div className="flex items-center justify-center gap-2">
                          {actionLoading === request.id ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <><X className="w-4 h-4" />Reject</>}
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 modern-scrollbar min-h-0 relative z-10">
        <AnimatePresence>
          {friends.length === 0 ? (
            <motion.div className="flex flex-col items-center justify-center h-full text-center py-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
              <motion.div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #64748b, #475569)" }} animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Users className="w-8 h-8 text-neutral-400" />
              </motion.div>
              <h3 className="text-white font-medium mb-2">No friends yet</h3>
              <p className="text-neutral-400 text-sm">Add someone to start chatting!</p>
            </motion.div>
          ) : (
            friends.map((friend, index) => (
              <motion.div key={friend.id} className="p-4 rounded-xl glass-card hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 + 0.3 }} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => onSelectFriend?.(friend.id, friend)}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-transparent to-orange-500/0 group-hover:from-purple-500/5 group-hover:to-orange-500/5 transition-all duration-300" />
                <div className="flex items-center gap-4 relative z-10">
                  <motion.div className="relative flex-shrink-0" whileHover={{ scale: 1.1 }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg, #a855f7, #f97316)" }}>
                      {friend.avatar?.startsWith("/avatars/") ? <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" /> : <span className="text-white text-lg font-bold">{friend.avatar || friend.username[0].toUpperCase()}</span>}
                    </div>
                    <motion.div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg ${onlineUsers.has(friend.id) ? "bg-green-400" : "bg-neutral-500"}`} animate={onlineUsers.has(friend.id) ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 4px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] } : {}} transition={{ duration: 2, repeat: Infinity }} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base truncate">{friend.username}</h3>
                    <p className="text-neutral-400 text-sm flex items-center gap-2">
                      {onlineUsers.has(friend.id) ? <><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div><span>Online</span></> : <><div className="w-2 h-2 bg-neutral-500 rounded-full"></div><span>Offline</span></>}
                    </p>
                  </div>
                  <motion.button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }} disabled={actionLoading === friend.id} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {actionLoading === friend.id ? <motion.div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} /> : <UserMinus className="w-4 h-4 text-red-400" />}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
