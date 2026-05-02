import { Navigate, Route, Routes } from "react-router-dom";

import { appPaths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoute";
import { OrganizationBoundary } from "./OrganizationBoundary";
import { AppShellLayout } from "@/app/layouts/AppShellLayout";
import AdminGovernance from "@/routes/pages/AdminGovernance";
import AIReview from "@/routes/pages/AIReview";
import Auth from "@/routes/pages/Auth";
import BatchesList from "@/routes/pages/BatchesList";
import CreateBatch from "@/routes/pages/CreateBatch";
import Dashboard from "@/routes/pages/Dashboard";
import FailureRecovery from "@/routes/pages/FailureRecovery";
import ImagePlan from "@/routes/pages/ImagePlan";
import IntakeMapping from "@/routes/pages/IntakeMapping";
import MobileCompanion from "@/routes/pages/MobileCompanion";
import NotFound from "@/routes/pages/NotFound";
import RowInspector from "@/routes/pages/RowInspector";
import SavedViews from "@/routes/pages/SavedViews";
import SellerDefaults from "@/routes/pages/SellerDefaults";
import StatesShowcase from "@/routes/pages/StatesShowcase";
import SubmissionMonitor from "@/routes/pages/SubmissionMonitor";
import SubmissionScope from "@/routes/pages/SubmissionScope";
import SupportInvestigation from "@/routes/pages/SupportInvestigation";
import TriageWorkspace from "@/routes/pages/TriageWorkspace";
import WorkspaceSelect from "@/routes/pages/WorkspaceSelect";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={appPaths.auth} element={<Auth />} />
      <Route element={<ProtectedRoute />}>
        <Route path={appPaths.home} element={<Navigate to={appPaths.workspace} replace />} />
        <Route path={appPaths.workspace} element={<WorkspaceSelect />} />
        <Route element={<OrganizationBoundary />}>
          <Route element={<AppShellLayout />}>
            <Route path={appPaths.dashboard} element={<Dashboard />} />
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
  );
}
