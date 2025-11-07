import React from "react";
import PublicationsFeed from "../Components/Publications/PublicationsFeed";
import { Layout } from "../Components/Layout";

const PublicationsPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-10 px-4">
        <PublicationsFeed />
      </div>
    </Layout>
  );
};

export default PublicationsPage;
