import { Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";
import Home from "./pages/Home.jsx";
import AuthProvider from "./auth/AuthProvider.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

import ConsoleEntry from "./pages/ConsoleEntry.jsx";
import ConsoleLayout from "./app/ConsoleLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ReservationCalendar from "./components/ReservationCalendar.jsx";

import FleetCapacity from "./pages/optimization/FleetPlanning/FleetPlanning.jsx";
import RouteOptimization from "./pages/optimization/RouteOptimization.jsx";
import NetworkPartitioning from "./pages/optimization/NetworkPartitioning.jsx";
import ResourceAllocation from "./pages/optimization/ResourceAllocation.jsx";
import PackingScheduling from "./pages/optimization/PackingScheduling.jsx";
import Graph from "./pages/graph/Index.jsx";
import ML from "./pages/ml/Index.jsx";
import IAM from "./pages/iam/Index.jsx";
import Cost from "./pages/cost/Index.jsx";
import UserAdmin from "./pages/admin/UserAdmin.jsx";
import TenantAdmin from "./pages/admin/TenantAdmin.jsx";
import ProviderAdmin from "./pages/admin/ProviderAdmin.jsx";

// verticals (detail pages)
import Cybersecurity from "./pages/verticals/Cybersecurity.jsx";
import Energy from "./pages/verticals/Energy.jsx";
import Logistics from "./pages/verticals/Logistics.jsx";
import Pharmaceuticals from "./pages/verticals/Pharmaceuticals.jsx";

export default function App() {
  return (
    <AuthProvider>
      <TopBar />
      <Routes>
        {/* public site */}
        <Route path="/" element={<Home />} />

        {/* vertical detail pages at the root */}
        <Route path="/verticals">
          <Route path="cybersecurity" element={<Cybersecurity />} />
          <Route path="energy" element={<Energy />} />
          <Route path="logistics" element={<Logistics />} />
          <Route path="pharmaceuticals" element={<Pharmaceuticals />} />
        </Route>

        {/* console entry + app */}
        <Route path="/console" element={<ConsoleEntry />} />
        <Route path="/reservations" element={
          <ProtectedRoute redirectTo="/console">
            <ReservationCalendar />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute redirectTo="/console">
            <TenantAdmin />
          </ProtectedRoute>
        } />
        <Route path="/provider-admin" element={
          <ProtectedRoute redirectTo="/console">
            <ProviderAdmin />
          </ProtectedRoute>
        } />
        <Route
          path="/console/app"
          element={
            <ProtectedRoute redirectTo="/console">
              <ConsoleLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="optimization/fleet-capacity" element={<FleetCapacity />} />
          <Route path="optimization/route-optimization" element={<RouteOptimization />} />
          <Route path="optimization/network-partitioning" element={<NetworkPartitioning />} />
          <Route path="optimization/resource-allocation" element={<ResourceAllocation />} />
          <Route path="optimization/packing-scheduling" element={<PackingScheduling />} />
          <Route path="graph" element={<Graph />} />
          <Route path="ml" element={<ML />} />
          <Route path="iam" element={<IAM />} />
          <Route path="cost" element={<Cost />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
