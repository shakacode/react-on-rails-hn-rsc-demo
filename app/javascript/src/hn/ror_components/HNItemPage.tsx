import React from "react";

import Layout from "../components/Layout";
import ItemPage from "../components/ItemPage";

interface HNItemPageProps {
  commitHash?: string;
  itemId?: number | string;
}

function normalizeItemId(rawItemId: number | string | undefined): number {
  if (typeof rawItemId === "number") {
    return rawItemId > 0 ? Math.floor(rawItemId) : 0;
  }

  if (typeof rawItemId === "string") {
    const parsed = Number(rawItemId);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }

  return 0;
}

export default function HNItemPage({ commitHash, itemId }: HNItemPageProps) {
  return (
    <Layout commitHash={commitHash}>
      <ItemPage itemId={normalizeItemId(itemId)} />
    </Layout>
  );
}
