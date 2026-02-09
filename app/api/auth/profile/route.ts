import { NextRequest, NextResponse } from "next/server";
import { updateUserProfileComplete, getUserByUsername } from "@/lib/postgres";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

// PATCH/PUT: Update user profile, including username uniqueness check
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
    const { username, avatar, coverImage, status, bio } = body;

    // Validate inputs
    if (
      !username ||
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 32
    ) {
      return NextResponse.json(
        { error: "Username must be 3-32 characters" },
        { status: 400 }
      );
    }
    // Check if username is taken (case-insensitive, except for current user)
    const existing = await getUserByUsername(username);
    if (existing && existing.id !== decoded.userId) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }
    if (!avatar || typeof avatar !== "string") {
      return NextResponse.json(
        { error: "Avatar is required" },
        { status: 400 }
      );
    }
    if (!status || !["online", "idle", "dnd", "invisible", "offline"].includes(status)) {
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
      username,
      avatar,
      status,
      bio || "",
      coverImage || ""
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
          coverImage: updatedUser.cover_image,
          status: updatedUser.status,
          bio: updatedUser.bio,
          createdAt: updatedUser.created_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the actual error for debugging
    // Profile update error: (error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
