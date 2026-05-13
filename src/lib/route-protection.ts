import { NextResponse } from "next/server";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

export async function withRateLimit(
  request: Request,
  action: string,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const identifier = `${ip}-${userAgent}`.slice(0, 200);

  const result = await checkRateLimit(identifier, action);

  if (!result.success) {
    if (result.blocked) {
      return NextResponse.json(
        {
          error: "Muitas tentativas. Tente novamente mais tarde.",
          retryAfter: result.resetAt ? Math.ceil((result.resetAt.getTime() - Date.now()) / 1000) : 900,
        },
        {
          status: 429,
          headers: {
            "Retry-After": result.resetAt ? Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString() : "900",
          },
        }
      );
    }
  }

  try {
    const response = await handler();
    
    if (response.status === 200) {
      await resetRateLimit(identifier, action);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}