import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import PharmacyProfilePage from "./pages/PharmacyProfilePage";
import InventoryPage from "./pages/InventoryPage";
import ReservationsPage from "./pages/ReservationsPage";
import ReviewsPage from "./pages/ReviewsPage";

function LoginRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

// These pages all assume pharmacy._id is already available. If someone
// types the URL directly (rather than clicking a disabled nav item),
// send them back to "/" where the pharmacy setup form lives.
function RequiresPharmacy({ children }) {
  const { pharmacy, pharmacyLoading, pharmacyNotFound } = useAuth();
  if (pharmacyLoading) return null;
  if (!pharmacy && pharmacyNotFound) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<PharmacyProfilePage />} />
            <Route
              path="inventory"
              element={
                <RequiresPharmacy>
                  <InventoryPage />
                </RequiresPharmacy>
              }
            />
            <Route
              path="reservations"
              element={
                <RequiresPharmacy>
                  <ReservationsPage />
                </RequiresPharmacy>
              }
            />
            <Route
              path="reviews"
              element={
                <RequiresPharmacy>
                  <ReviewsPage />
                </RequiresPharmacy>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}