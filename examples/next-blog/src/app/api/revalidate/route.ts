import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type RevalidatePayload = {
  pageId?: string;
  paths?: string[];
};

const getSecret = () => process.env.REVALIDATE_SECRET;

export async function POST(request: Request) {
  const secret = getSecret();
  const url = new URL(request.url);
  const provided = url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: RevalidatePayload = {};
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    payload = {};
  }

  const paths = new Set<string>();

  if (payload.pageId) {
    paths.add(`/posts/${payload.pageId}`);
  }

  if (Array.isArray(payload.paths)) {
    payload.paths.forEach((path) => {
      if (typeof path === "string" && path.trim().length > 0) {
        paths.add(path);
      }
    });
  }

  if (paths.size === 0) {
    return NextResponse.json({ ok: false, error: "No paths provided" }, { status: 400 });
  }

  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({ ok: true, revalidated: Array.from(paths) });
}
