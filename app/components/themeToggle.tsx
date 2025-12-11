import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { Moon, Sun } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";

function ColorSchemeToggleClient() {
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme();

  return (
    <ActionIcon
      variant="default"
      size="lg"
      onClick={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")}
    >
      {colorScheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </ActionIcon>
  );
}

export function ColorSchemeToggle() {
  return <ClientOnly>{() => <ColorSchemeToggleClient />}</ClientOnly>;
}
