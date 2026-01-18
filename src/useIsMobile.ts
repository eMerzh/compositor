import { em } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"

const useIsMobile = () => {
  return useMediaQuery(`(max-width: ${em(750)})`)
}
export default useIsMobile
