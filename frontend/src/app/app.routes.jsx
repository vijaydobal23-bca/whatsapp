import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage.jsx"));
const HomePage = lazy(() => import("../features/home/pages/HomePage.jsx"));
const Protected = lazy(() => import("../features/auth/components/Protected.jsx"));

import ErrorBoundary from "./ErrorBoundary.jsx";

import { AuthContextProvider } from "../features/auth/auth.context.jsx";
import { HomeContextProvider } from "../features/home/homeContext.jsx";
import { SocketContextProvider } from "../context/SocketContext.jsx";

import { CallContextProvider } from "../features/calling/call.context.jsx";
import CallingInterface from "../features/calling/components/CallingInterface.jsx";

const RootLayout = () => {
  return (
    <AuthContextProvider>
      <SocketContextProvider>
        <CallContextProvider>
          <HomeContextProvider>
            <Outlet />
            <CallingInterface />
          </HomeContextProvider>
        </CallContextProvider>
      </SocketContextProvider>
    </AuthContextProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Protected>
              <ErrorBoundary>
                <HomePage />
              </ErrorBoundary>
            </Protected>
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
      },
      {
        path: "/register",
        element: <Suspense fallback={<div>Loading...</div>}>
            <RegisterPage />
          </Suspense>
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

export default router;
