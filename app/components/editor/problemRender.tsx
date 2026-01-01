import { Button, Fieldset, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
} from "@yoopta/editor";
import { Pencil, Upload } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFetcher, useRevalidator } from "react-router";

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
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!problem) return;
    const evtSource = new EventSource(`/api/problem/${problem.id}/status`);
    evtSource.onmessage = (event) => {
      try {
        if (event.data) {
          revalidator.revalidate();
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => {
      evtSource.close();
    };
  }, [problem?.id]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      notifications.show({
        title: "保存しました",
        message: "回答を保存しました",
        color: "green",
        position: "top-right",
        autoClose: 2000,
      });
    } else if (fetcher.state === "idle" && fetcher.data?.success === false) {
      notifications.show({
        title: "保存失敗",
        message: "保存に失敗しました",
        color: "red",
        position: "top-right",
        autoClose: 2000,
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Fieldset
      disabled={problem?.status === "CLOSED" || problem?.status === "GRADED"}
      legend={problem?.name ?? ""}
      variant="filled"
      className="my-3"
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
                    problem.id,
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
            onClick={() => revalidator.revalidate()}
            loading={revalidator.state === "loading"}
          >
            問題を解く
          </Button>
        </div>
      )}
    </Fieldset>
  );
}
