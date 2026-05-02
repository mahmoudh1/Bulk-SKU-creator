import { Navigate } from "react-router-dom";

import { appPaths } from "@/app/routes/paths";

const Index = () => <Navigate to={appPaths.workspace} replace />;

export default Index;
