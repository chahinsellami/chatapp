import { NextRequest, NextResponse } from "next/server";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

// You must set these in your environment variables
const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "";

export async function POST(req: NextRequest) {
  const { channelName, uid, role = "publisher" } = await req.json();

  // Check for required credentials with detailed logging
  if (!APP_ID) {
    console.error(
      "❌ NEXT_PUBLIC_AGORA_APP_ID not set in environment variables",
    );
    return NextResponse.json(
      {
        error:
          "Agora APP_ID not configured. Add NEXT_PUBLIC_AGORA_APP_ID to environment variables.",
      },
      { status: 500 },
    );
  }

  if (!APP_CERTIFICATE) {
    console.error("❌ AGORA_APP_CERTIFICATE not set in environment variables");
    console.error(
      `⚠️  This is CRITICAL for token generation - calls will fail without it`,
    );
    console.error(`✅ APP_ID is set: ${APP_ID.substring(0, 5)}...`);
    return NextResponse.json(
      {
        error:
          "Agora APP_CERTIFICATE not configured. Add AGORA_APP_CERTIFICATE to environment variables.",
      },
      { status: 500 },
    );
  }

  if (!channelName || !uid) {
    console.warn("⚠️  Token request missing required params", {
      channelName,
      uid,
    });
    return NextResponse.json(
      { error: "Missing channelName or uid" },
      { status: 400 },
    );
  }

  try {
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
      privilegeExpireTs,
    );

    console.log(
      `✅ Agora token generated for channel: ${channelName}, user: ${uid}`,
    );
    return NextResponse.json({ token });
  } catch (error) {
    console.error("❌ Error generating Agora token:", error);
    return NextResponse.json(
      { error: "Failed to generate token", details: String(error) },
      { status: 500 },
    );
  }
}
