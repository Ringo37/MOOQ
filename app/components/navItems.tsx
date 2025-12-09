import { NavLink, Tooltip } from "@mantine/core";

export type NavItem = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  to?: string;
};

export function NavItems({
  data,
  opened,
  active,
  setActive,
  transitionDuration,
}: {
  data: NavItem[];
  opened: boolean;
  active: number;
  setActive: (i: number) => void;
  transitionDuration: number;
}) {
  return data.map((item, index) => {
    const isActive = index === active;

    return (
      <Tooltip
        key={item.label}
        label={item.label}
        position="right"
        withArrow
        transitionProps={{ duration: 0 }}
        disabled={opened}
      >
        <NavLink
          active={isActive}
          label={item.label}
          leftSection={<item.icon size={20} strokeWidth={2} />}
          onClick={() => setActive(index)}
          variant="light"
          styles={{
            root: {
              justifyContent: opened ? "flex-start" : "center",
              height: 44,
              overflow: "hidden",
              borderRadius: 0,
              boxSizing: "border-box",
              borderLeft: isActive
                ? `4px solid var(--mantine-primary-color-filled)`
                : "4px solid transparent",
            },
            section: {
              width: 30,
              minWidth: 30,
              display: "flex",
              marginRight: opened ? 10 : 0,
              transition: `all ${transitionDuration}ms ease`,
            },
            body: {
              textOverflow: "clip",
            },
            label: {
              whiteSpace: "nowrap",
              opacity: opened ? 1 : 0,
              width: opened ? "auto" : 0,
              transform: opened ? "translateX(0)" : "translateX(10px)",
              transition: `all ${transitionDuration}ms ease`,
              textOverflow: "clip",
              overflow: "hidden",
            },
          }}
        />
      </Tooltip>
    );
  });
}
