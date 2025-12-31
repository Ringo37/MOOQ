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
          const status = (await getProblemStatus(problemId)) as string;
          if (status !== lastStatus) {
            lastStatus = status;
            controller.enqueue(encoder.encode(`data: ${status}\n\n`));
          }
        } catch (err) {
          console.error(err);
        }
      }, 3000);

      this.cancel = () => clearInterval(interval);
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
