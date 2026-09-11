import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import HomePage from "../features/home/pages/HomePage.jsx";
import Protected from "../features/auth/components/Protected.jsx";
import { AuthContextProvider } from "../features/auth/auth.context.jsx";
import { HomeContextProvider } from "../features/home/homeContext.jsx";
import { SocketContextProvider } from "../context/SocketContext.jsx";

const RootLayout = () => {
  return (
    <AuthContextProvider>
      <SocketContextProvider>
        <HomeContextProvider>
          <Outlet />
        </HomeContextProvider>
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
          <Protected>
            <HomePage />
          </Protected>
        ),
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

export default router;
