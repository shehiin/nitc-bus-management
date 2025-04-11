import { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import StudentDashboard from "./components/StudentDashboard";
import DriverDashboard from "./components/DriverDashboard";
import { supabase } from "./lib/supabase";
import routes from "tempo-routes";

type UserRole = "student" | "driver" | null;

function App() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    // Check if user is a student
    const { data: studentData } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (studentData) {
      setUserRole("student");
      setLoading(false);
      return;
    }

    // Check if user is a driver
    const { data: driverData } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (driverData) {
      setUserRole("driver");
      setLoading(false);
      return;
    }

    // If we get here, user has no role
    setUserRole(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/student-dashboard"
            element={
              userRole === "student" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/driver-dashboard"
            element={
              userRole === "driver" ? (
                <DriverDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
