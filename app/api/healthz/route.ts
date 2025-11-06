import { NextResponse } from "next/server";

/**
 * Health check endpoint for the Next.js app + backend connectivity
 * GET /api/healthz
 */
export async function GET() {
  try {
    const workerBaseUrl = process.env.WORKER_BASE_URL?.trim();
    
    if (!workerBaseUrl) {
      return NextResponse.json(
        {
          status: "unhealthy",
          message: "WORKER_BASE_URL not configured",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Check backend connectivity
    const backendHealthUrl = `${workerBaseUrl.replace(/\/$/, "")}/healthz`;
    const startTime = Date.now();
    
    try {
      const response = await fetch(backendHealthUrl, {
        method: "GET",
        headers: { "User-Agent": "ai-podcast-nextjs/healthcheck" },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      const latency = Date.now() - startTime;
      
      if (!response.ok) {
        return NextResponse.json(
          {
            status: "degraded",
            message: `Backend returned ${response.status}`,
            backend: {
              url: backendHealthUrl,
              status: response.status,
              latency: `${latency}ms`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 503 }
        );
      }

      return NextResponse.json({
        status: "healthy",
        message: "Next.js app and backend are operational",
        backend: {
          url: backendHealthUrl,
          status: response.status,
          latency: `${latency}ms`,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (fetchError) {
      const err = fetchError as Error;
      return NextResponse.json(
        {
          status: "unhealthy",
          message: "Backend unreachable",
          backend: {
            url: backendHealthUrl,
            error: err?.message || "Network error",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      {
        status: "error",
        message: err?.message || "Unexpected error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

