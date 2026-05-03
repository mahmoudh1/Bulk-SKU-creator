import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { appPaths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import { OrganizationBoundary } from "./OrganizationBoundary";
import { AppShellLayout } from "@/app/layouts/AppShellLayout";
import Auth from "@/routes/pages/Auth";
import BatchesList from "@/routes/pages/BatchesList";
import CreateBatch from "@/routes/pages/CreateBatch";
import Dashboard from "@/routes/pages/Dashboard";
import NotFound from "@/routes/pages/NotFound";
import WorkspaceSelect from "@/routes/pages/WorkspaceSelect";

const AdminGovernance = lazy(() => import("@/routes/pages/AdminGovernance"));
const AIReview = lazy(() => import("@/routes/pages/AIReview"));
const FailureRecovery = lazy(() => import("@/routes/pages/FailureRecovery"));
const ImageAssets = lazy(() => import("@/routes/pages/ImageAssets"));
const ImagePlan = lazy(() => import("@/routes/pages/ImagePlan"));
const IntakeMapping = lazy(() => import("@/routes/pages/IntakeMapping"));
const MobileCompanion = lazy(() => import("@/routes/pages/MobileCompanion"));
const RowInspector = lazy(() => import("@/routes/pages/RowInspector"));
const SavedViews = lazy(() => import("@/routes/pages/SavedViews"));
const SellerDefaults = lazy(() => import("@/routes/pages/SellerDefaults"));
const StatesShowcase = lazy(() => import("@/routes/pages/StatesShowcase"));
const SubmissionMonitor = lazy(() => import("@/routes/pages/SubmissionMonitor"));
const SubmissionScope = lazy(() => import("@/routes/pages/SubmissionScope"));
const SupportInvestigation = lazy(() => import("@/routes/pages/SupportInvestigation"));
const TriageWorkspace = lazy(() => import("@/routes/pages/TriageWorkspace"));

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="text-sm text-muted-foreground" role="status">
        Loading...
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path={appPaths.auth} element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route path={appPaths.home} element={<Navigate to={appPaths.workspace} replace />} />
          <Route path={appPaths.workspace} element={<WorkspaceSelect />} />
          <Route element={<OrganizationBoundary />}>
            <Route element={<AppShellLayout />}>
              <Route path={appPaths.dashboard} element={<Dashboard />} />
              <Route path={appPaths.imageAssets} element={<ImageAssets />} />
              <Route path={appPaths.batches} element={<BatchesList />} />
              <Route path={appPaths.createBatch} element={<CreateBatch />} />
              <Route path="/batches/:id/mapping" element={<IntakeMapping />} />
              <Route path="/batches/:id/review" element={<TriageWorkspace />} />
              <Route path="/batches/:id/rows/:rowId" element={<RowInspector />} />
              <Route path="/batches/:id/ai-review" element={<AIReview />} />
              <Route path="/batches/:id/images" element={<ImagePlan />} />
              <Route path="/batches/:id/submit" element={<SubmissionScope />} />
              <Route path={appPaths.submissions} element={<SubmissionMonitor />} />
              <Route path={appPaths.submissionFailures} element={<FailureRecovery />} />
              <Route path={appPaths.sellerDefaults} element={<SellerDefaults />} />
              <Route path={appPaths.savedViews} element={<SavedViews />} />
              <Route path={appPaths.support} element={<SupportInvestigation />} />
              <Route path={appPaths.admin} element={<AdminGovernance />} />
              <Route path={appPaths.states} element={<StatesShowcase />} />
              <Route path={appPaths.mobile} element={<MobileCompanion />} />
              <Route path={appPaths.reviewHub} element={<Navigate to={appPaths.batches} replace />} />
              <Route path={appPaths.reviewRowsHub} element={<Navigate to={appPaths.batches} replace />} />
              <Route path={appPaths.reviewAiHub} element={<Navigate to={appPaths.batches} replace />} />
              <Route path={appPaths.reviewImagesHub} element={<Navigate to={appPaths.batches} replace />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
