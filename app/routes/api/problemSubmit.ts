import { data } from "react-router";

import { upsertAnswer } from "~/models/answer.server";
import { getAnswerField } from "~/models/answerField.server";
import { uploadFile } from "~/models/file.server";
import { getProblemById } from "~/models/problem.server";
import { requireUser } from "~/services/auth.server";

import type { Route } from "./+types/problemSubmit";

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const problemId = params.id!;
  const formData = await request.formData();
  const problem = await getProblemById(problemId);
  if (!problem) return null;
  if (problem.status !== "OPEN") {
    return data({ success: false });
  }

  for (const key of formData.keys()) {
    const values = formData.getAll(key);
    const answerField = await getAnswerField(problemId, key);
    if (!answerField) return data({ success: false });

    // File
    if (values[0] instanceof File) {
      const file = values[0] as File;
      if (file.size === 0) continue;
      const uploadedFile = await uploadFile(
        file,
        `answer/user-${user.id}/problem-${problemId}/${key}}`,
        `/file/answer/${problemId}/${answerField.name}`,
      );
      await upsertAnswer(
        answerField.id,
        user.id,
        uploadedFile.name,
        uploadedFile.id,
      );
      continue;
    }

    // Checkbox
    if (values.length > 1) {
      await upsertAnswer(answerField.id, user.id, values.join(","));
      continue;
    }

    // Text / Radio
    const value = values[0]?.toString() ?? "";
    await upsertAnswer(answerField.id, user.id, value);
  }

  return data({ success: true });
}
