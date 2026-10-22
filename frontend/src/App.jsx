import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EventsPage from "./pages/EventsPage";
import MyTicketsPage from "./pages/MyTicketsPage";

const OrganizerPanel = lazy(() => import("./pages/OrganizerPanel"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-tickets" element={<MyTicketsPage />} />
          </Route>
          <Route element={<ProtectedRoute requiredRole="organizer" />}>
            <Route
              path="/organizer"
              element={
                <Suspense fallback={<p className="page">Loading organizer panel...</p>}>
                  <OrganizerPanel />
                </Suspense>
              }
            />
          </Route>
          <Route path="*" element={<main className="page"><h1>404 - Page not found</h1></main>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
