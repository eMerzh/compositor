import { IconBrandGithub } from "@tabler/icons-react"

import { Footer, Text } from "@mantine/core"

const AppFooter = () => {
  return (
    <Footer height={60} p="md">
      <Text c="dimmed" size="sm" align="center">
        Made by{" "}
        <a href="https://github.com/eMerzh/compositor">
          <IconBrandGithub size="1rem" />
        </a>{" "}
        Brice
      </Text>
      <Text c="dimmed" size="sm" align="center">
        Question, Suggestions, Soutiens ➤ compositor__at__bmaron.net
      </Text>
    </Footer>
  )
}

export default AppFooter
