import type { Metadata } from "next";
import RecommendationsClient from "./page-client";

// NOTE This is a server-side component
// (sub-pages do not need additional " | ${siteConfig.name}")
export const metadata: Metadata = {
    title: `Recommendations`,
};

export default function Recommendations() {
    // Must split server-side component (^) from client-side component @ "./page-client.tsx::RecommendationsClient()"
    return <RecommendationsClient />;
}
