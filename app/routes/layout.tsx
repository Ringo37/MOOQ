import { Outlet, useMatches } from "react-router";

import type { IconName, NavGroup } from "~/components/navItems";
import { Sidebar } from "~/components/sidebar";
import { requireUser } from "~/services/auth.server";
import { getSidebarInitialOpen } from "~/utils/sidebarUtils";

import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const initialOpen = getSidebarInitialOpen(request);

  return { initialOpen, user };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const leafRoute = matches[matches.length - 1];
  const { user } = loaderData;
  const sidebarData = (leafRoute?.loaderData as { sidebarData?: NavGroup[] })
    ?.sidebarData;

  const links = [{ title: "トップ", link: "/courses" }];
  if (user.role === "ADMIN" || user.role === "EDITOR") {
    links.push({ title: "コース管理", link: "/courses-admin" });
  }
  if (user.role === "ADMIN") {
    links.push({ title: "管理画面", link: "/admin" });
  }

  const defaultData = [
    {
      icon: "link" as IconName,
      label: "リンク",
      items: links,
    },
  ];

  const activeData = sidebarData
    ? sidebarData.concat(defaultData)
    : defaultData;
  return (
    <Sidebar initialOpen={loaderData.initialOpen} data={activeData}>
      <Outlet />
    </Sidebar>
  );
}
