import { AppShell, Burger, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "react-router";

import { NavItems, type NavGroup } from "./navItems";
import { NavUser } from "./navUser";
import { ColorSchemeToggle } from "./themeToggle";

export function Sidebar({
  initialOpen,
  children,
  data,
}: {
  initialOpen: boolean;
  children: React.ReactNode;
  data: NavGroup[];
}) {
  const [opened, { toggle }] = useDisclosure(initialOpen, {
    onOpen: () =>
      (document.cookie = `sidebar-open=true; path=/; max-age=31536000; SameSite=Lax`),
    onClose: () =>
      (document.cookie = `sidebar-open=false; path=/; max-age=31536000; SameSite=Lax`),
  });

  const transitionDuration = 300;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: opened ? 300 : 60,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      transitionDuration={transitionDuration}
      transitionTimingFunction="ease"
    >
      {/* ===== Header ===== */}
      <AppShell.Header style={{ zIndex: 300 }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Link to="/courses">
              <Title order={1}>MOOQ</Title>
            </Link>
          </Group>

          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      {/* ===== Sidebar ===== */}
      <AppShell.Navbar
        p={0}
        bg="body"
        style={{
          transition: `width ${transitionDuration}ms ease`,
        }}
      >
        {/* Items */}
        <NavItems
          data={data}
          opened={opened}
          transitionDuration={transitionDuration}
        />

        {/* User */}
        <NavUser opened={opened} transitionDuration={transitionDuration} />
      </AppShell.Navbar>

      {/* ===== Main ===== */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
