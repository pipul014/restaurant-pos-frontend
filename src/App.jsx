//add tracking
import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Header from "./components/shared/Header";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import useLoadData from "./hooks/useLoadData";
import useRealtimeSync from "./hooks/useRealtimeSync";

const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Orders = lazy(() => import("./pages/Orders"));
const Tables = lazy(() => import("./pages/Tables"));
const Menu = lazy(() => import("./pages/Menu"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MoreDashboard = lazy(() => import("./pages/MoreDashboard"));
const CookDashboard = lazy(() => import("./pages/CookDashboard"));
const RestaurantSettings = lazy(() => import("./pages/RestaurantSettings"));
const PublicInvoice = lazy(() => import("./pages/PublicInvoice"));
const PublicOrderTracking = lazy(() => import("./pages/PublicOrderTracking"));

function Layout() {
  const location = useLocation();
  const { isAuth, role } = useSelector((state) => state.user);

  const isAuthRoute = location.pathname === "/auth";
  const isPublicInvoiceRoute = location.pathname.startsWith("/public/invoice");
  const isPublicTrackingRoute = location.pathname.startsWith("/track/");

  const isPublicRoute = isPublicInvoiceRoute || isPublicTrackingRoute;

  useRealtimeSync({
    skip: isPublicRoute,
  });

  const isLoading = useLoadData({
    skip: isAuthRoute || isPublicRoute,
  });

  if (isLoading && !isAuthRoute && !isPublicRoute) {
    return <FullScreenLoader />;
  }

  const redirectAfterLogin =
    role === "Cook"
      ? "/cook-dashboard?tab=Pending"
      : "/orders?tab=Orders&status=All";

  return (
    <>
      {isAuth && !isAuthRoute && !isPublicRoute && <Header />}

      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route
            path="/public/invoice/:invoiceNo"
            element={<PublicInvoice />}
          />

          <Route path="/track/:token" element={<PublicOrderTracking />} />

          <Route
            path="/"
            element={
              !isAuth ? (
                <Navigate to="/auth" replace />
              ) : role === "Cook" ? (
                <Navigate to="/cook-dashboard?tab=Pending" replace />
              ) : role === "Cashier" ? (
                <Navigate to="/orders?tab=Orders&status=All" replace />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="/auth"
            element={
              isAuth ? <Navigate to={redirectAfterLogin} replace /> : <Auth />
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoutes allowedRoles={["Admin", "Cashier"]}>
                <Orders />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/tables"
            element={
              <ProtectedRoutes allowedRoles={["Admin", "Cashier"]}>
                <Tables />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/menu"
            element={
              <ProtectedRoutes allowedRoles={["Admin", "Cashier"]}>
                <Menu />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoutes allowedRoles={["Admin"]}>
                <Dashboard />
              </ProtectedRoutes>
            }
          />


          <Route
            path="/settings"
            element={
              <ProtectedRoutes allowedRoles={["Admin"]}>
                <RestaurantSettings />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/more"
            element={
              <ProtectedRoutes allowedRoles={["Admin", "Cashier"]}>
                <MoreDashboard />
              </ProtectedRoutes>
            }
          />

          <Route
            path="/cook-dashboard"
            element={
              <ProtectedRoutes allowedRoles={["Cook", "Admin"]}>
                <CookDashboard />
              </ProtectedRoutes>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function ProtectedRoutes({ children, allowedRoles }) {
  const { isAuth, role } = useSelector((state) => state.user);

  if (!isAuth) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "Cook") {
      return <Navigate to="/cook-dashboard?tab=Pending" replace />;
    }

    return <Navigate to="/orders?tab=Orders&status=All" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
