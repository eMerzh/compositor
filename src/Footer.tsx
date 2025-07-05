import { AppShell, Text } from "@mantine/core"
import { IconBrandGithub } from "@tabler/icons-react"

const AppFooter = () => {
  return (
    <AppShell.Footer p="md">
      <Text c="dimmed" size="sm" ta="center">
        Made by{" "}
        <a href="https://github.com/eMerzh/compositor">
          <IconBrandGithub size="1rem" />
        </a>{" "}
        Brice
      </Text>
      <Text c="dimmed" size="sm" ta="center">
        Question, Suggestions, Soutiens ➤ compositor__at__bmaron.net
      </Text>
    </AppShell.Footer>
  )
}

export default AppFooter
