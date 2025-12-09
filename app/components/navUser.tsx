import { NavLink, Tooltip } from "@mantine/core";
import { LogOut } from "lucide-react";

export function NavUser({
  opened,
  transitionDuration,
}: {
  opened: boolean;
  transitionDuration: number;
}) {
  return (
    <div style={{ marginTop: "auto" }}>
      <Tooltip label="ログアウト" position="right" withArrow disabled={opened}>
        <NavLink
          label="ログアウト"
          leftSection={<LogOut size={20} strokeWidth={2} />}
          color="red"
          variant="subtle"
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
      </Tooltip>
    </div>
  );
}
