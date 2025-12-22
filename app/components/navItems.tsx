import { Accordion, Menu, Box, Text, NavLink } from "@mantine/core";
import {
  Bookmark,
  BookOpen,
  Home,
  Settings,
  User,
  Link as LinkIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";

export const IconMap = {
  home: Home,
  settings: Settings,
  user: User,
  book: BookOpen,
  bookmark: Bookmark,
  link: LinkIcon,
};

export type IconName = keyof typeof IconMap;

interface NavSubItem {
  title: string;
  link: string;
}

export interface NavGroup {
  icon: IconName;
  label: string;
  items: NavSubItem[];
}

function NavItemHeader({
  icon,
  label,
  showLabel,
  isActive,
  height,
  iconSize,
  paddingLeft,
}: {
  icon: IconName;
  label: string;
  showLabel: boolean;
  isActive: boolean;
  height: number;
  iconSize: number;
  paddingLeft: number;
}) {
  const IconComponent = IconMap[icon] || IconMap.home;
  return (
    <Box
      style={{
        height,
        display: "flex",
        alignItems: "center",
        borderLeft: isActive
          ? "4px solid var(--mantine-primary-color-filled)"
          : "4px solid transparent",
        paddingLeft: paddingLeft + 4,
        gap: 12,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      <Box style={{ display: "flex" }}>
        <IconComponent size={iconSize} strokeWidth={2} />
      </Box>

      {showLabel && (
        <Text
          size="sm"
          style={{
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {label}
        </Text>
      )}
    </Box>
  );
}

export function NavItems({
  data,
  opened,
  transitionDuration,
}: {
  data: NavGroup[];
  opened: boolean;
  transitionDuration: number;
}) {
  const location = useLocation();

  const ITEM_HEIGHT = 44;
  const ICON_SIZE = 20;
  const CONTENT_PADDING_LEFT = 12;

  return (
    <Accordion
      transitionDuration={transitionDuration}
      chevronPosition="right"
      py={10}
    >
      {data.map((group, index) => {
        const Icon = group.icon;
        const isActive = group.items.some(
          (item) => location.pathname === item.link,
        );

        if (opened) {
          return (
            <Accordion.Item
              value={String(index)}
              key={group.label}
              style={{ border: "none" }}
            >
              <Accordion.Control
                styles={{
                  control: {
                    color: "var(--mantine-color-text)",
                    height: ITEM_HEIGHT,
                    padding: 0,
                    backgroundColor: "transparent",
                  },
                  chevron: {
                    marginRight: 15,
                  },
                }}
              >
                <NavItemHeader
                  icon={Icon}
                  label={group.label}
                  showLabel
                  isActive={isActive}
                  height={ITEM_HEIGHT}
                  iconSize={ICON_SIZE}
                  paddingLeft={CONTENT_PADDING_LEFT}
                />
              </Accordion.Control>

              <Accordion.Panel>
                {group.items.map((item) => (
                  <NavLink
                    label={item.title}
                    component={Link}
                    key={item.link}
                    to={item.link}
                    variant="subtle"
                    active={location.pathname === item.link}
                    styles={{
                      root: { whiteSpace: "nowrap", overflow: "hidden" },
                      label: { whiteSpace: "nowrap" },
                    }}
                  />
                ))}
              </Accordion.Panel>
            </Accordion.Item>
          );
        }

        return (
          <Menu
            key={group.label}
            trigger="hover"
            position="right-start"
            withArrow
            offset={10}
          >
            <Menu.Target>
              <Box>
                <NavItemHeader
                  icon={Icon}
                  label={group.label}
                  showLabel={false}
                  isActive={isActive}
                  height={ITEM_HEIGHT}
                  iconSize={ICON_SIZE}
                  paddingLeft={CONTENT_PADDING_LEFT}
                />
              </Box>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>{group.label}</Menu.Label>
              {group.items.map((item) => (
                <Link
                  to={item.link}
                  key={item.link}
                  style={{ textDecoration: "none" }}
                >
                  <Menu.Item>{item.title}</Menu.Item>
                </Link>
              ))}
            </Menu.Dropdown>
          </Menu>
        );
      })}
    </Accordion>
  );
}
