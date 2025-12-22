import { NavLink, Menu } from "@mantine/core";
import { User, Settings, LogOut } from "lucide-react";
import { useFetcher } from "react-router";

export function NavUser({
  opened,
  transitionDuration,
}: {
  opened: boolean;
  transitionDuration: number;
}) {
  const fetcher = useFetcher();
  return (
    <div style={{ marginTop: "auto" }}>
      <Menu
        trigger={opened ? "click" : "hover"}
        position={opened ? "top" : "right"}
        withArrow={!opened}
      >
        <Menu.Target>
          <NavLink
            label="アカウント"
            leftSection={<User size={20} strokeWidth={2} />}
            color="red"
            variant="subtle"
            onClick={(e) => !opened && e.preventDefault()}
            styles={{
              root: {
                justifyContent: opened ? "flex-start" : "center",
                height: 44,
                overflow: "hidden",
                borderRadius: 0,
                borderLeft: "4px solid transparent",
              },
              section: {
                marginRight: opened ? 10 : 0,
                transition: `margin-right ${transitionDuration}ms ease`,
                paddingLeft: 4,
              },
              body: {
                textOverflow: "clip",
              },
              label: {
                whiteSpace: "nowrap",
                opacity: opened ? 1 : 0,
                width: opened ? "auto" : 0,
                transition: `all ${transitionDuration}ms ease`,
                textOverflow: "clip",
                overflow: "hidden",
              },
            }}
          />
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>アカウント</Menu.Label>
          <Menu.Item leftSection={<User size={14} />}>プロフィール</Menu.Item>
          <Menu.Item leftSection={<Settings size={14} />}>設定</Menu.Item>
          <Menu.Divider />
          <fetcher.Form method="post" action="/logout">
            <Menu.Item
              color="red"
              leftSection={<LogOut size={14} />}
              type="submit"
            >
              ログアウト
            </Menu.Item>
          </fetcher.Form>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
