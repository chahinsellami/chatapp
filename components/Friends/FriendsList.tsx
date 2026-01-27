"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  UserMinus,
} from "lucide-react";

type UserId = string;

export interface Friend {
  id: UserId;
  username: string;
  avatar?: string | null;
  // keep optional status so caller types with/without status remain compatible
  status?: string;
}

export interface Request {
  id: string;
  username: string;
  avatar?: string | null;
  createdAt: string;
}

interface Props {
  friends?: Friend[];
  onlineUsers?: Set<UserId>;
  actionLoading?: string | number | null;
  handleRemoveFriend?: (id: string) => void;
  pendingRequests?: Request[];
  expandPending?: boolean;
  setExpandPending?: (v: boolean) => void;
  handleAcceptRequest?: (id: string) => void;
  handleRejectRequest?: (id: string) => void;
  // second parameter intentionally `any` for compatibility with callers
  onSelectFriend?: (id: string, friend?: any) => void;
  userId?: string;
  onRefresh?: () => void;
}

export default function FriendsList({
  friends = [],
  onlineUsers = new Set<string>(),
  actionLoading,
  handleRemoveFriend,
  pendingRequests = [],
  expandPending = false,
  setExpandPending = () => {},
  handleAcceptRequest,
  handleRejectRequest,
  onSelectFriend,
}: Props) {
  return (
    <motion.div
      className="flex-1 flex flex-col bg-neutral-950 relative overflow-hidden"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header with Friends title */}
      <motion.div className="flex items-center gap-3 p-4 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Friends</h3>
          <p className="text-neutral-500 text-xs">
            {friends.length} friend{friends.length !== 1 ? "s" : ""}
          </p>
        </div>
      </motion.div>

      {/* Pending requests (collapsible) */}
      {pendingRequests.length > 0 && (
        <div className="border-b border-white/10">
          <button
            className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5"
            onClick={() => setExpandPending(!expandPending)}
          >
            <div className="transform">
              {expandPending ? (
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium text-sm">
                Pending Requests
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                {pendingRequests.length}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {expandPending && (
              <motion.div
                className="px-4 pb-3 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                {pendingRequests.map((req: Request, i: number) => (
                  <motion.div
                    key={req.id}
                    className="p-3 rounded-lg bg-neutral-900/40"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-neutral-700 flex items-center justify-center text-white font-bold">
                        {req.avatar &&
                        (req.avatar.startsWith("http") ||
                          req.avatar.startsWith("/")) ? (
                          <Image
                            src={req.avatar}
                            alt={req.username}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          req.username[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {req.username}
                        </div>
                        <div className="text-neutral-400 text-xs">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest?.(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 bg-green-600 rounded text-white text-sm"
                        >
                          <Check className="w-4 h-4 inline-block mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest?.(req.id)}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 bg-red-600 rounded text-white text-sm"
                        >
                          <X className="w-4 h-4 inline-block mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Friends list - Facebook Messenger Style */}
      <div className="flex-1 overflow-y-auto space-y-1 hide-scrollbar">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-neutral-800">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            <div className="text-white font-medium mb-1">No friends yet</div>
            <div className="text-neutral-400 text-sm">
              Add someone to start chatting
            </div>
          </div>
        ) : (
          friends.map((f: Friend, idx: number) => (
            <motion.div
              key={f.id}
              className="mx-2 p-2.5 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-neutral-800 transition-colors group relative"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => onSelectFriend?.(f.id, f)}
            >
              {/* Avatar with online status */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {f.avatar &&
                  (f.avatar.startsWith("http") || f.avatar.startsWith("/")) ? (
                    <Image
                      src={f.avatar}
                      alt={f.username}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    f.username[0]?.toUpperCase()
                  )}
                </div>
                {/* Online indicator */}
                {f.status === "online" && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-950" />
                )}
              </div>

              {/* Chat info */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {f.username}
                </div>
                <div className="text-neutral-500 text-xs truncate">
                  {f.status === "online" ? "Active now" : "Offline"}
                </div>
              </div>

              {/* Remove button (show on hover) */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFriend?.(f.id);
                }}
                disabled={actionLoading === f.id}
                className="p-2 rounded-full hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserMinus className="w-4 h-4 text-red-400" />
              </motion.button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
