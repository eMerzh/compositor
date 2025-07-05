import { AppShell, MantineProvider } from "@mantine/core"
import { QueryParamProvider } from "use-query-params"
import { WindowHistoryAdapter } from "use-query-params/adapters/window"
import "@mantine/core/styles.css"

import AppContainer from "./AppContainer"
import Footer from "./Footer"
import { usePostHog } from "./usePostHog"

export default function Home() {
  usePostHog("phc_2lIfwJfGNtF7JQFwruM1lRlFGXCwvIpgGLgaTTs28Lh", {
    api_host: "https://eu.posthog.com",
  })

  return (
    <MantineProvider>
      <QueryParamProvider adapter={WindowHistoryAdapter}>
        <AppShell footer={{ height: 60 }}>
          <AppContainer />
          <Footer />
        </AppShell>
      </QueryParamProvider>
    </MantineProvider>
  )
}
