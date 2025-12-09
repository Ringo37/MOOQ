import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Form, redirect, useSearchParams } from "react-router";

import {
  authenticator,
  createUserSession,
  getUser,
} from "~/services/auth.server";
import { safeRedirect } from "~/utils/safeRedirect";

import type { Route } from "./+types/login";

export async function action({ request }: Route.ActionArgs) {
  try {
    const requestClone = request.clone();
    const formData = await request.formData();
    const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
    const remember = formData.get("remember");
    const user = await authenticator.authenticate("user-pass", requestClone);

    return createUserSession({
      redirectTo,
      remember: remember === "on" ? true : false,
      request,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  const url = new URL(request.url);
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"));

  if (user) return redirect(redirectTo);

  return null;
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  return (
    <Container size={420} my={40}>
      <Title ta="center" className="">
        Welcome back!
      </Title>

      <Text className="">
        Do not have an account yet? <Anchor>Create account</Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <Form method="post">
          <TextInput
            label="Email"
            placeholder="mooq@example.com"
            required
            radius="md"
            name="email"
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            radius="md"
            name="password"
          />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" radius="md" type="submit">
            Sign in
          </Button>
        </Form>
      </Paper>
    </Container>
  );
}
