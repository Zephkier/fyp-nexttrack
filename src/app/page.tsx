import type { Metadata } from "next";
import { siteConfig } from "@/app/config/site";
import HomeClient from "./page-client";

// NOTE This is a server-side component
// NOTE Only root page needs additional " | ${siteConfig.name}"
// due to being in the same directory level as the root layout
export const metadata: Metadata = {
    title: `Home | ${siteConfig.name}`,
};

export default function Home() {
    // Must split server-side component (^) from client-side component @ "./page-client.tsx::HomeClient()"
    return <HomeClient />;
}
