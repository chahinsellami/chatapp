import { NextRequest, NextResponse } from "next/server";
import { updateUserProfileComplete } from "@/lib/postgres";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { avatar, status, bio } = body;

    // Validate inputs
    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json(
        { error: "Avatar is required" },
        { status: 400 }
      );
    }

    if (!status || !["online", "idle", "dnd", "invisible"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (bio && typeof bio !== "string") {
      return NextResponse.json(
        { error: "Bio must be a string" },
        { status: 400 }
      );
    }

    if (bio && bio.length > 150) {
      return NextResponse.json(
        { error: "Bio must be 150 characters or less" },
        { status: 400 }
      );
    }

    // Update user in database and get updated user
    const updatedUser = await updateUserProfileComplete(
      decoded.userId,
      avatar,
      status,
      bio || ""
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return updated user
    return NextResponse.json(
      {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
          bio: updatedUser.bio,
          createdAt: updatedUser.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
