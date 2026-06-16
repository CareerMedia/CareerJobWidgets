import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { FeedConfigsProvider } from "../state/feedConfigs";
import { WidgetSettingsProvider } from "../state/widgetSettings";
import { PublicHomePage } from "./PublicHomePage";
import { JobsPage } from "./JobsPage";
import { AdminPage } from "./AdminPage";
import { EmbedAllJobsPage } from "./embeds/EmbedAllJobsPage";
import { EmbedFeaturedJobsPage } from "./embeds/EmbedFeaturedJobsPage";
import { EmbedFeedTabsPage } from "./embeds/EmbedFeedTabsPage";
import { EmbedFeedDirectoryPage } from "./embeds/EmbedFeedDirectoryPage";
import { EmbedFeedFeaturedPage } from "./embeds/EmbedFeedFeaturedPage";

export function App() {
  return (
    <WidgetSettingsProvider>
      <FeedConfigsProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Embed-only routes */}
          <Route path="/embed/all-jobs" element={<EmbedAllJobsPage />} />
          <Route path="/embed/featured-jobs" element={<EmbedFeaturedJobsPage />} />
          <Route path="/embed/feed-tabs" element={<EmbedFeedTabsPage />} />
          <Route path="/embed/feed/:feedId/directory" element={<EmbedFeedDirectoryPage />} />
          <Route path="/embed/feed/:feedId/featured" element={<EmbedFeedFeaturedPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
      </FeedConfigsProvider>
    </WidgetSettingsProvider>
  );
}

