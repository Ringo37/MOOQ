import { getProblemStatus } from "~/models/problem.server";

import type { Route } from "./+types/problemStatus";

export async function loader({ params }: Route.LoaderArgs) {
  const problemId = params.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let lastStatus: string | null = null;

      const interval = setInterval(async () => {
        try {
          const status = await getProblemStatus(problemId);

          const statusStr = JSON.stringify(status);
          if (statusStr !== lastStatus) {
            lastStatus = statusStr;
            const data = `data: ${statusStr}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);

      return () => clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
