import { NextResponse } from "next/server";
import { getUsers } from "../../../db/queries";
import { checkAuth } from "../../../utils/auth";

// GET /api/users
export async function GET(request: Request) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
