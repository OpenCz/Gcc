import { Stack, Text, NavLink } from "@mantine/core";
import { IconLayoutList } from "@tabler/icons-react";

export type Page = "resources";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: "resources", label: "Ressources", icon: <IconLayoutList size={16} /> },
];

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <Stack
      gap={4}
      p="xs"
      style={{
        width: 192,
        flexShrink: 0,
        paddingTop: 20,
      }}
    >
      <Text
        size="xs"
        fw={700}
        px="xs"
        mb={4}
        style={{ letterSpacing: "0.2em", color: "white" }}
      >
        OVERVIEW
        <Text component="span" c="epitech">_</Text>
      </Text>

      {NAV_ITEMS.map(({ page, label, icon }) => (
        <NavLink
          key={page}
          label={label}
          leftSection={icon}
          active={currentPage === page}
          onClick={() => onNavigate(page)}
          color="epitech"
          style={currentPage === page ? { background: "var(--epi-blue)", color: "#fff" } : undefined}
        />
      ))}
    </Stack>
  );
}
