import React from "react";

import Layout from "../components/Layout";
import UserPage from "../components/UserPage";

interface HNUserPageProps {
  commitHash?: string;
  userId?: string;
}

export default function HNUserPage({ commitHash, userId }: HNUserPageProps) {
  return (
    <Layout commitHash={commitHash}>
      <UserPage userId={userId ?? ""} />
    </Layout>
  );
}
