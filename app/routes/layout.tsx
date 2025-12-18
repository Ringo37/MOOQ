import { Gauge, Home, Settings, User } from "lucide-react";
import { Outlet, useMatches } from "react-router";

import { Sidebar } from "~/components/sidebar";
import { requireUser } from "~/services/auth.server";
import { getSidebarInitialOpen } from "~/utils/sidebarUtils";

import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const initialOpen = getSidebarInitialOpen(request);

  return { initialOpen };
}

const data = [
  { icon: Home, label: "ホーム" },
  { icon: Gauge, label: "ダッシュボード" },
  { icon: Settings, label: "設定" },
  { icon: User, label: "アカウント" },
];

export default function Layout({ loaderData }: Route.ComponentProps) {
  useMatches();
  return (
    <Sidebar initialOpen={loaderData.initialOpen} data={data}>
      <Outlet />
    </Sidebar>
  );
}
