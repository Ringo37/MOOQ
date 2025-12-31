import { Button, Fieldset, Text } from "@mantine/core";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { Pencil, Upload } from "lucide-react";
import { useMemo } from "react";
import { useFetcher } from "react-router";

import type { Problem } from "generated/prisma/client";
import type { AnswerWithAnswerField } from "~/models/answer.server";
import { injectAnswer } from "~/utils/problem";

import { problemPlugins } from "./config";

interface RenderProps {
  problem: Problem | null;
  cover: YooptaContentValue | null;
  answers: AnswerWithAnswerField[] | null;
}

export function ProblemRender({ problem, cover, answers }: RenderProps) {
  const editor = useMemo(() => createYooptaEditor(), []);
  const fetcher = useFetcher();

  return (
    <Fieldset
      disabled={problem?.status === "CLOSED" || problem?.status === "GRADED"}
      legend={problem?.name ?? ""}
      variant="filled"
    >
      {problem && (
        <fetcher.Form
          method="post"
          action={`/api/problem/${problem.id}`}
          encType="multipart/form-data"
        >
          <YooptaEditor
            editor={editor}
            plugins={problemPlugins as any} // eslint-disable-line
            value={
              problem?.content
                ? injectAnswer(
                    JSON.parse(problem.content) as YooptaContentValue,
                    answers ?? [],
                  )
                : undefined
            }
            autoFocus
            className="w-full! pb-2!"
            readOnly
          />
          <Button
            leftSection={<Upload size={14} color="white" />}
            type="submit"
          >
            提出
          </Button>
        </fetcher.Form>
      )}
      {cover && !problem && (
        <div>
          <YooptaEditor
            editor={editor}
            plugins={problemPlugins as any} // eslint-disable-line
            value={cover}
            autoFocus
            className="w-full! pb-2!"
            readOnly
          />
          <Text className="py-3!">現在この問題は非公開です</Text>
          <Button
            leftSection={<Pencil size={14} color="white" />}
            color="green"
          >
            問題を解く
          </Button>
        </div>
      )}
    </Fieldset>
  );
}
