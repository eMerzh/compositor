import { MantineProvider } from "@mantine/core";
import { QueryParamProvider } from "use-query-params";
import { WindowHistoryAdapter } from "use-query-params/adapters/window";

import Footer from "./Footer";
import AppContainer from "./AppContainer";

export default function Home() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <QueryParamProvider adapter={WindowHistoryAdapter}>
        <div></div>
        <AppContainer />
        <Footer />
      </QueryParamProvider>
    </MantineProvider>
  );
}
