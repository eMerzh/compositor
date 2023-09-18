import { Badge } from "@mantine/core";
import { ReactNode } from "react";

function perc2color(perc: number) {
  let r,
    g = 0;
  const b = 0;
  if (perc < 50) {
    r = 255;
    g = Math.round(5.1 * perc);
  } else {
    g = 255;
    r = Math.round(510 - 5.1 * perc);
  }
  const h = r * 0x10000 + g * 0x100 + b * 0x1;
  return "#" + ("000000" + h.toString(16)).slice(-6);
}
const Score = ({ score, children }: { score: number; children: ReactNode }) => {
  const color = perc2color(score * 10);

  return (
    <Badge
      styles={(theme) => ({
        root: {
          backgroundColor: color,
          color: theme.colorScheme === "dark" ? theme.colors.blue[1] : theme.colors.dark[4],
        },
      })}
    >
      {" "}
      {children}
    </Badge>
  );
};

export default Score;
