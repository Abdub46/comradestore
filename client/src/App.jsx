import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Banner from './components/Banner';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import MaintenanceBanner from './components/MaintenanceBanner';
import Loader from './components/Loader';
import { trackPageView } from './services/analyticsService';

// Lazy-loaded: each page is its own JS chunk, downloaded only when someone
// actually navigates to it - shrinks the initial bundle the browser has to
// download before the site becomes interactive.
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SellItem = lazy(() => import('./pages/SellItem'));
const EditProduct = lazy(() => import('./pages/EditProduct'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SavedItems = lazy(() => import('./pages/SavedItems'));
const Wanted = lazy(() => import('./pages/Wanted'));
const CreateWanted = lazy(() => import('./pages/CreateWanted'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const SuggestImprovement = lazy(() => import('./pages/SuggestImprovement'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <MaintenanceBanner />
      <Banner />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/about" element={<AboutUs />} />

            <Route
              path="/suggest-improvement"
              element={
                <PrivateRoute>
                  <SuggestImprovement />
                </PrivateRoute>
              }
            />

            <Route
              path="/sell"
              element={
                <PrivateRoute>
                  <SellItem />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-product/:id"
              element={
                <PrivateRoute>
                  <EditProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/saved"
              element={
                <PrivateRoute>
                  <SavedItems />
                </PrivateRoute>
              }
            />
            <Route path="/wanted" element={<Wanted />} />
            <Route
              path="/wanted/new"
              element={
                <PrivateRoute>
                  <CreateWanted />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}