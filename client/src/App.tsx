import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./contexts/Auth";
import TradeHistory from "./pages/TradeHistory";
import { ToastProvider } from "./contexts/Toast";
import { socket } from "./socket";
import { useEffect } from "react";

function App() {

  useEffect(() => {
    socket.on("connect_error", (err) => { console.log("error on connection: " + err) })
  }, [])

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trade-history" element={<TradeHistory />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
