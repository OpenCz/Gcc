import { useState } from "react";
import { Stack, Group, Text, TextInput, PasswordInput, Button, Anchor, Paper } from "@mantine/core";
import epitechLogo from "../assets/img/epitech_logo.png";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: appel API auth
    setLoading(false);
    onLogin();
  };

  return (
    <Stack style={{ minHeight: "100vh", background: "var(--epi-bg)" }} gap={0}>
      <Group
        justify="space-between"
        px="md"
        style={{ height: 48, borderBottom: "1px solid var(--epi-border)", flexShrink: 0 }}
      >
        <img src={epitechLogo} alt="Epitech" style={{ height: 24, width: "auto" }} />
        <Text size="sm" fw={700} style={{ letterSpacing: "0.25em" }}>
          CODING <Text component="span" c="epitech">CLUB</Text> EPITECH
        </Text>
        <div style={{ width: 80 }} />
      </Group>

      <Stack flex={1} align="center" justify="center" p="md">
        <Stack style={{ width: "100%", maxWidth: 360 }} gap="md">
          <Paper withBorder p="xl">
            <Stack gap="md">
              <Stack gap={4}>
                <Text size="xl" fw={700}>Connexion</Text>
                <Text size="sm" c="dimmed">Accédez aux ressources du Coding Club</Text>
              </Stack>

              <form onSubmit={handleSubmit}>
                <Stack gap="sm">
                  <TextInput
                    label="Email"
                    placeholder="prenom.nom@epitech.eu"
                    value={email}
                    onChange={e => setEmail(e.currentTarget.value)}
                  />
                  <PasswordInput
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.currentTarget.value)}
                  />
                  <Button type="submit" loading={loading} fullWidth mt={4} color="epitech">
                    Se connecter
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Paper>

          <Text size="xs" c="dimmed" ta="center">
            Étudiant Epitech ?{" "}
            <Anchor size="xs" c="epitech" href="#">
              Connexion via my.epitech.eu
            </Anchor>
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}
