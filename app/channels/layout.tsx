"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import MembersList from "@/components/Layout/MembersList";
import ChatArea from "@/components/Chat/ChatArea";

export default function ChannelsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { channelId?: string };
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedChannelId, setSelectedChannelId] = useState("general");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#36393F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B65F5] mx-auto mb-4"></div>
          <p className="text-[#DCDDDE]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#36393F]">
      {/* Sidebar */}
      <Sidebar
        selectedChannelId={selectedChannelId}
        onChannelSelect={setSelectedChannelId}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header channelId={selectedChannelId} user={user} />

        {/* Chat and Members */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat area */}
          <ChatArea channelId={selectedChannelId} user={user} />

          {/* Members list */}
          <MembersList channelId={selectedChannelId} />
        </div>
      </div>
    </div>
  );
}
