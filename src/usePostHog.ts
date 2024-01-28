import posthog, { PostHogConfig } from "posthog-js";
import { useEffect } from "react";


export const usePostHog = (
    apiKey: string,
    config?: Partial<PostHogConfig>,
): void => {

    useEffect(() => {
        // Init PostHog
        posthog.init(apiKey, config);

        // Track page views
    }, [apiKey, config]);
};
