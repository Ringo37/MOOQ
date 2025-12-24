import {
  ColorSchemeScript,
  Container,
  MantineProvider,
  Text,
  Title,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./app.css";
import {
  getColorScheme,
  cookieColorSchemeManager,
} from "./utils/cookieColorScheme";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const colorSchemeManager = cookieColorSchemeManager();

export async function loader({ request }: Route.LoaderArgs) {
  const colorScheme = getColorScheme(request);
  return { colorScheme };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();
  const colorScheme = data?.colorScheme ?? "light";
  return (
    <html lang="ja" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript defaultColorScheme={colorScheme} />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider
          colorSchemeManager={colorSchemeManager}
          defaultColorScheme={colorScheme}
        >
          <Notifications />
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let errorStatus = "500";

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status.toString();
    message =
      error.status === 404 ? "Nothing to see here" : "Something went wrong";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
    errorStatus = "Error";
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col justify-center items-center py-16">
      <div
        className="
        absolute top-2/5 left-1/2 z-0
        -translate-x-1/2 -translate-y-1/2
        font-black leading-none
        text-[200px] md:text-[500px]
        text-gray-200 dark:text-gray-600
        opacity-60 md:opacity-30
        select-none pointer-events-none
      "
      >
        {errorStatus}
      </div>

      <Container className="relative z-10 w-full text-center">
        <Title className="text-4xl font-black md:text-5xl px-4">
          {message}
        </Title>

        <Text c="dimmed" size="lg" mt="md" maw={540} mx="auto" className="px-4">
          {details}
        </Text>
      </Container>
      {stack && (
        <Container mt="xl" className="relative z-20 w-full max-w-4xl px-4">
          <pre className="w-full p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-sm text-red-600 dark:text-red-400 font-mono shadow-sm text-left">
            <code>{stack}</code>
          </pre>
        </Container>
      )}
    </main>
  );
}
