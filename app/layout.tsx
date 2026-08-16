import React from "react";

require("../src/index.css");

export const metadata = {
  title: "Urban Heat Island Mitigation Planner",
  description:
    "Next.js App Router Urban Heat Island Mitigation Planner with Supabase & PostGIS integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}