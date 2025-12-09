import { Gauge, Home, Settings, User } from "lucide-react";
import { Outlet } from "react-router";

import { Sidebar } from "~/components/sidebar";
import { getSidebarInitialOpen } from "~/utils/sidebarUtils";

import type { Route } from "./+types/index";

export async function loader({ request }: Route.LoaderArgs) {
  const initialOpen = getSidebarInitialOpen(request);

  return { initialOpen };
}

/* ===== メニュー定義 ===== */
const data = [
  { icon: Home, label: "ホーム" },
  { icon: Gauge, label: "ダッシュボード" },
  { icon: Settings, label: "設定" },
  { icon: User, label: "アカウント" },
];

export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <Sidebar initialOpen={loaderData.initialOpen} data={data}>
      <Outlet />
    </Sidebar>
  );
}
