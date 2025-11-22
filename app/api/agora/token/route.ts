import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

// You must set these in your environment variables
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "";

export async function POST(req: NextRequest) {
  const { channelName, uid, role = "publisher" } = await req.json();
  if (!APP_ID || !APP_CERTIFICATE) {
    return NextResponse.json(
      { error: "Agora credentials not set" },
      { status: 500 }
    );
  }
  if (!channelName || !uid) {
    return NextResponse.json(
      { error: "Missing channelName or uid" },
      { status: 400 }
    );
  }
  const expireTime = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTs = currentTimestamp + expireTime;
  const agoraRole =
    role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    agoraRole,
    privilegeExpireTs
  );
  return NextResponse.json({ token });
}
