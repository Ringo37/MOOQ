import {
  AppShell,
  Burger,
  Group,
  Title,
  Text,
  Box,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

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
      (document.cookie = `sidebar-open=true; path=/; max-age=31536000; SameSite=Lax`),
    onClose: () =>
      (document.cookie = `sidebar-open=false; path=/; max-age=31536000; SameSite=Lax`),
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
        {/* ===== Search ===== */}
        <Box
          style={{
            height: opened ? "auto" : 0,
            overflow: "hidden",
            transition: `height ${transitionDuration}ms ease`,
          }}
        >
          <Box px="sm" py="xs">
            <TextInput
              size="sm"
              placeholder="Search..."
              leftSection={<Search size={16} />}
              style={{
                pointerEvents: opened ? "auto" : "none",
                opacity: opened ? 1 : 0,
                transition: `opacity ${transitionDuration}ms ease`,
              }}
            />
          </Box>
        </Box>

        {/* Menu */}
        <div
          style={{
            height: 20,
            marginBottom: 10,
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
