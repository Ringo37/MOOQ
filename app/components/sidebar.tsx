import { AppShell, Burger, Group, Title, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

import { NavItems, type NavItem } from "./navItems";
import { NavUser } from "./navUser";
import { ColorSchemeToggle } from "./themeToggle";

export function Sidebar({
  initialOpen,
  children,
  data,
}: {
  initialOpen: boolean;
  children: React.ReactNode;
  data: NavItem[];
}) {
  const [opened, { toggle }] = useDisclosure(initialOpen, {
    onOpen: () =>
      (document.cookie = `sidebar-open=true; path=/; max-age=31536000`),
    onClose: () =>
      (document.cookie = `sidebar-open=false; path=/; max-age=31536000`),
  });
  const [active, setActive] = useState(0);

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
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Title order={1}>MOOQ</Title>
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
        {/* Menu */}
        <div
          style={{
            height: 20,
            marginBottom: 10,
            marginTop: 10,
            paddingLeft: 10,
            overflow: "hidden",
            transition: `all ${transitionDuration}ms ease`,
          }}
        >
          <Text
            size="xs"
            fw={500}
            c="dimmed"
            style={{
              whiteSpace: "nowrap",
              opacity: opened ? 1 : 0,
              transition: `opacity ${transitionDuration}ms ease`,
            }}
          >
            Menu
          </Text>
        </div>

        {/* Items */}
        <NavItems
          data={data}
          opened={opened}
          active={active}
          setActive={setActive}
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
