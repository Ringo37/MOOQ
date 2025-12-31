import type { YooptaContentValue } from "@yoopta/editor";

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
