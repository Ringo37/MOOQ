import { Outlet, useMatches } from "react-router";

import type { IconName, NavGroup } from "~/components/navItems";
import { Sidebar } from "~/components/sidebar";
import { requireUser } from "~/services/auth.server";
import { getSidebarInitialOpen } from "~/utils/sidebarUtils";

import type { Route } from "./+types/layout";

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  const initialOpen = getSidebarInitialOpen(request);

  return { initialOpen };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const leafRoute = matches[matches.length - 1];
  const sidebarData = (leafRoute?.loaderData as { sidebarData?: NavGroup[] })
    ?.sidebarData;

  const defaultData = [
    {
      icon: "link" as IconName,
      label: "リンク",
      items: [{ title: "トップ", link: "/courses" }],
    },
  ];

  const activeData = sidebarData || defaultData;
  return (
    <Sidebar initialOpen={loaderData.initialOpen} data={activeData}>
      <Outlet />
    </Sidebar>
  );
}
