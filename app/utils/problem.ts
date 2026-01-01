import type { YooptaContentValue } from "@yoopta/editor";

import type { AnswerWithAnswerField } from "~/models/answer.server";

export function extractAnswerFieldNames(content: YooptaContentValue): string[] {
  const names = new Set<string>();

  Object.values(content).forEach((block) => {
    block.value?.forEach((node) => {
      if (typeof node === "object" && node !== null && "type" in node) {
        if (node.type.startsWith("problem-")) {
          const name = (node as any).props?.name; // eslint-disable-line
          if (name) {
            if (names.has(name)) {
              throw new Error(`Duplicate field name found: ${name}`);
            }
            names.add(name);
          }
        }
      }
    });
  });

  return Array.from(names);
}

export function validateAnswerFieldNames(content: YooptaContentValue): void {
  const names = new Set<string>();
  for (const block of Object.values(content)) {
    if (!block.value) continue;
    for (const node of block.value) {
      if (typeof node === "object" && node !== null && "type" in node) {
        if (typeof node.type === "string" && node.type.startsWith("problem-")) {
          const name = (node as any).props?.name; // eslint-disable-line
          if (name) {
            if (names.has(name)) {
              throw new Error(`Duplicate field name found: "${name}"`);
            }
            names.add(name);
          }
        }
      }
    }
  }
}

export function injectAnswer(
  content: YooptaContentValue,
  answers: AnswerWithAnswerField[],
  problemId: string,
): YooptaContentValue {
  const answerMap = new Map<string, AnswerWithAnswerField>();

  for (const a of answers.filter(
    (a) => a.answerField.problemId === problemId,
  )) {
    if (answerMap.has(a.answerField.name)) {
      throw new Error(`Duplicate answerFieldId found: ${a.answerField.name}`);
    }
    answerMap.set(a.answerField.name, a);
  }

  Object.values(content).forEach((block) => {
    block.value?.forEach((node) => {
      if (
        typeof node === "object" &&
        node !== null &&
        "type" in node &&
        typeof node.type === "string" &&
        node.type.startsWith("problem-")
      ) {
        const props = (node as any).props; // eslint-disable-line
        const name = props?.name;
        if (!name) return;
        const answer = answerMap.get(name);
        if (!answer) return;
        if (node.type === "problem-file-input") {
          props.fileName = answer.file?.name;
          props.fileUrl = answer.file?.url;
        } else if (node.type === "problem-checkbox") {
          props.value = Array.from(answer.answer?.split(",") ?? []);
        } else {
          props.value = answer.answer;
        }
      }
    });
  });

  return content;
}
