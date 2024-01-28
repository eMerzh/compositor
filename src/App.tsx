import { AppShell, MantineProvider } from "@mantine/core";
import { QueryParamProvider } from "use-query-params";
import { WindowHistoryAdapter } from "use-query-params/adapters/window";

import Footer from "./Footer";
import AppContainer from "./AppContainer";
import { usePostHog } from "./usePostHog";

export default function Home() {
  usePostHog('phc_2lIfwJfGNtF7JQFwruM1lRlFGXCwvIpgGLgaTTs28Lh', { api_host: 'https://eu.posthog.com' })

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <QueryParamProvider adapter={WindowHistoryAdapter}>
        <AppShell footer={<Footer />}>
          <AppContainer />
        </AppShell>
      </QueryParamProvider>
    </MantineProvider>
  );
}
