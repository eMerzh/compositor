import { IconBrandGithub } from "@tabler/icons-react";

import { Container, Text } from "@mantine/core";

const Footer = () => {
  return (
    <Container className="footer">
      <Text c="dimmed" size="sm" align="center">
        Made by{" "}
        <a href="https://github.com/eMerzh/compositor">
          <IconBrandGithub size="1rem" />
        </a>{" "}
        Brice
      </Text>
      <Text c="dimmed" size="sm" align="center">
        Question - Suggestions - Soutiens → compositor__at__bmaron.net
      </Text>
    </Container>
  );
};

export default Footer;
