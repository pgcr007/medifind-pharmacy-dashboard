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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<PharmacyProfilePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
