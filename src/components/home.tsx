import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, MapPin, User, UserCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [driverId, setDriverId] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Demo credentials
  const demoStudentEmail = "mohammedshehinkt@gmail.com";
  const demoStudentPassword = "student123";
  const demoDriverId = "DRIVER001";
  const demoDriverPassword = "driver123";
  const demoDriverEmail = "shehiinkt@gmail.com";

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For demo purposes, special flow for demo credentials
      if (
        studentEmail === demoStudentEmail &&
        studentPassword === demoStudentPassword
      ) {
        // First check if the user exists
        const { data: existingUser, error: existingUserError } = await supabase
          .from("auth_users")
          .select("*")
          .eq("email", demoStudentEmail)
          .single();

        // if (existingUserError || !existingUser) {
        //   // Create demo account if it doesn't exist
        //   await handleDemoStudentSetup();
        //   return;
        // }

        // If demo user exists, sign them in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: demoStudentEmail,
          password: demoStudentPassword,
        });

        if (error) throw error;

        toast({
          title: "Demo login successful",
          description: "Welcome to NITC Smart Bus demo!",
        });

        navigate("/student-dashboard");
        return;
      }

      // Regular login flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: studentEmail,
        password: studentPassword,
      });

      if (error) throw error;

      // Check if user is a student
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) throw new Error("Authentication failed");

      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (studentError || !studentData) {
        await supabase.auth.signOut();
        throw new Error("Not authorized as a student");
      }

      toast({
        title: "Login successful",
        description: "Welcome back to NITC Smart Bus!",
      });

      navigate("/student-dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // For demo purposes, special flow for demo credentials
      if (driverId === demoDriverId && driverPassword === demoDriverPassword) {
        // First check if the driver exists
        const { data: existingDriver, error: existingDriverError } =
          await supabase
            .from("drivers")
            .select("*")
            .eq("driver_id", demoDriverId)
            .single();

        console.log(demoDriverId);

        // if (existingDriverError || !existingDriver) {
        //   // Create demo driver if doesn't exist
        //   // await handleDemoDriverSetup();
        //   return;
        // }

        // If demo driver exists, sign them in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: demoDriverEmail,
          password: demoDriverPassword,
        });

        if (error) throw error;

        toast({
          title: "Demo login successful",
          description: "Welcome to the driver dashboard demo!",
        });

        navigate("/driver-dashboard");
        return;
      }

      // Regular driver login flow
      // First find the driver by driver_id
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("driver_id", driverId)
        .single();

      if (driverError || !driverData) {
        throw new Error("Driver ID not found");
      }

      // Sign in with associated email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: driverData.email,
        password: driverPassword,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back, driver!",
      });

      navigate("/driver-dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email: studentEmail,
        password: studentPassword,
        options: {
          data: {
            name: studentName,
            role: "student",
          },
        },
      });

      if (error) throw error;

      if (!data.user) throw new Error("Failed to create user account");

      // Then create student profile
      const { error: profileError } = await supabase.from("students").insert({
        user_id: data.user.id,
        email: studentEmail,
        name: studentName,
      });

      if (profileError) {
        // Clean up auth user if profile creation failed
        // Note: In a production app, you might want to implement a more robust cleanup
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error(
          `Failed to create student profile: ${profileError.message}`,
        );
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });

      setIsSignUp(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if driver ID already exists
      const { data: existingDriver, error: checkError } = await supabase
        .from("drivers")
        .select("driver_id")
        .eq("driver_id", driverId)
        .single();

      if (existingDriver) {
        throw new Error("Driver ID already exists");
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: driverEmail,
        password: driverPassword,
        options: {
          data: {
            name: driverName,
            role: "driver",
          },
        },
      });

      if (error) throw error;

      if (!data.user) throw new Error("Failed to create user account");

      // Create driver profile
      const { error: profileError } = await supabase.from("drivers").insert({
        user_id: data.user.id,
        email: driverEmail,
        name: driverName,
        driver_id: driverId,
      });

      if (profileError) {
        // Clean up auth user if profile creation failed
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error(
          `Failed to create driver profile: ${profileError.message}`,
        );
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });

      setIsSignUp(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for demo setup
  const handleDemoStudentSetup = async () => {
    try {
      setLoading(true);

      // Try to sign up the demo student
      const { data, error } = await supabase.auth.signUp({
        email: demoStudentEmail,
        password: demoStudentPassword,
        options: {
          data: {
            name: "Demo Student",
            role: "student",
          },
        },
      });

      if (error) {
        setError("Could not create demo account: " + error.message);
        return;
      }

      if (!data.user) {
        setError("Failed to create demo user account");
        return;
      }

      // Create student profile
      const { error: profileError } = await supabase.from("students").insert({
        user_id: data.user.id,
        email: demoStudentEmail,
        name: "Demo Student",
      });

      if (profileError) {
        setError("Could not create student profile: " + profileError.message);
        return;
      }

      // Auto sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoStudentEmail,
        password: demoStudentPassword,
      });

      if (signInError) {
        setError(
          "Account created but could not sign in: " + signInError.message,
        );
        return;
      }

      toast({
        title: "Demo account created",
        description: "Welcome to NITC Smart Bus demo!",
      });

      navigate("/student-dashboard");
    } catch (error) {
      setError("Demo setup error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoDriverSetup = async () => {
    try {
      setLoading(true);

      // Try to sign up the demo driver
      const { data, error } = await supabase.auth.signUp({
        email: demoDriverEmail,
        password: demoDriverPassword,
        options: {
          data: {
            name: "Demo Driver",
            role: "driver",
          },
        },
      });

      if (error) {
        setError("Could not create demo account: " + error.message);
        return;
      }

      if (!data.user) {
        setError("Failed to create demo user account");
        return;
      }

      // Create driver profile
      const { error: profileError } = await supabase.from("drivers").insert({
        user_id: data.user.id,
        email: demoDriverEmail,
        name: "Demo Driver",
        driver_id: demoDriverId,
      });

      if (profileError) {
        setError("Could not create driver profile: " + profileError.message);
        return;
      }

      // Auto sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoDriverEmail,
        password: demoDriverPassword,
      });

      if (signInError) {
        setError(
          "Account created but could not sign in: " + signInError.message,
        );
        return;
      }

      toast({
        title: "Demo account created",
        description: "Welcome to the driver dashboard demo!",
      });

      navigate("/driver-dashboard");
    } catch (error) {
      setError("Demo setup error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === "student") {
      setStudentEmail(demoStudentEmail);
      setStudentPassword(demoStudentPassword);
    } else {
      setDriverId(demoDriverId);
      setDriverPassword(demoDriverPassword);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">NITC Smart Bus</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a
              href="#about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-12 gap-12">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Smart School Bus{" "}
            <span className="text-primary">Routing System</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl">
            Optimize your campus commute with our intelligent bus routing
            system. Book your stops, track your bus in real-time, and enjoy a
            more efficient journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="gap-2">
              <User className="h-4 w-4" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <MapPin className="h-4 w-4" />
              Learn More
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="flex-1 max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student" className="gap-2">
                <UserCircle className="h-4 w-4" />
                Student
              </TabsTrigger>
              <TabsTrigger value="driver" className="gap-2">
                <Bus className="h-4 w-4" />
                Driver
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isSignUp ? "Student Registration" : "Student Login"}
                  </CardTitle>
                  <CardDescription>
                    {isSignUp
                      ? "Create an account to book bus stops and track your rides."
                      : "Access your dashboard to book bus stops and track your rides."}
                  </CardDescription>
                </CardHeader>
                {error && (
                  <div className="px-6">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}
                <CardContent className="space-y-4">
                  <form
                    onSubmit={
                      isSignUp ? handleStudentSignUp : handleStudentLogin
                    }
                  >
                    <div className="space-y-4">
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="student-name">Full Name</Label>
                          <Input
                            id="student-name"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="student-email">Email</Label>
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="your.email@nitc.ac.in"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="student-password">Password</Label>
                        <Input
                          id="student-password"
                          type="password"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading}
                      >
                        {loading
                          ? "Processing..."
                          : isSignUp
                            ? "Register"
                            : "Login to Student Dashboard"}
                      </Button>
                    </div>
                  </form>

                  {!isSignUp && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-center font-medium mb-2">
                        Demo Account
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fillDemoCredentials("student")}
                      >
                        Use Demo Credentials
                      </Button>
                      <div className="mt-2 text-xs text-center text-muted-foreground">
                        Email: {demoStudentEmail}
                        <br />
                        Password: {demoStudentPassword}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <div className="text-sm text-center text-slate-500">
                    {isSignUp
                      ? "Already have an account? "
                      : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                      className="text-primary hover:underline"
                    >
                      {isSignUp ? "Login" : "Register"}
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="driver">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isSignUp ? "Driver Registration" : "Driver Login"}
                  </CardTitle>
                  <CardDescription>
                    {isSignUp
                      ? "Create an account to access your route management dashboard."
                      : "Access your dashboard to view optimized routes and student pickups."}
                  </CardDescription>
                </CardHeader>
                {error && (
                  <div className="px-6">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}
                <CardContent className="space-y-4">
                  <form
                    onSubmit={isSignUp ? handleDriverSignUp : handleDriverLogin}
                  >
                    <div className="space-y-4">
                      {isSignUp && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="driver-name">Full Name</Label>
                            <Input
                              id="driver-name"
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="driver-email">Email</Label>
                            <Input
                              id="driver-email"
                              type="email"
                              placeholder="driver@nitc.ac.in"
                              value={driverEmail}
                              onChange={(e) => setDriverEmail(e.target.value)}
                              required
                            />
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="driver-id">Driver ID</Label>
                        <Input
                          id="driver-id"
                          placeholder="Enter your driver ID"
                          value={driverId}
                          onChange={(e) => setDriverId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driver-password">Password</Label>
                        <Input
                          id="driver-password"
                          type="password"
                          value={driverPassword}
                          onChange={(e) => setDriverPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading}
                      >
                        {loading
                          ? "Processing..."
                          : isSignUp
                            ? "Register"
                            : "Login to Driver Dashboard"}
                      </Button>
                    </div>
                  </form>

                  {!isSignUp && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-center font-medium mb-2">
                        Demo Account
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fillDemoCredentials("driver")}
                      >
                        Use Demo Credentials
                      </Button>
                      <div className="mt-2 text-xs text-center text-muted-foreground">
                        Driver ID: {demoDriverId}
                        <br />
                        Password: {demoDriverPassword}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <div className="text-sm text-center text-slate-500">
                    {isSignUp ? "Already have an account? " : "Need help? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                      }}
                      className="text-primary hover:underline"
                    >
                      {isSignUp ? "Login" : isSignUp ? "Login" : "Register"}
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our smart routing system offers a range of features to improve
              your campus commute experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-50 border-none">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Book your preferred campus stops and times through an
                  intuitive interface. Modify or cancel bookings with ease.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-none">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Bus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Track your bus in real-time with accurate ETAs to your stop.
                  Never miss your ride again.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-50 border-none">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                </div>
                <CardTitle>Route Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our system dynamically optimizes routes based on bookings,
                  skipping unnecessary stops and saving time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our smart routing system is designed to make your campus commute
              efficient and hassle-free.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Book Your Stop</h3>
              <p className="text-slate-600">
                Select your campus location and preferred pickup time.
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Route Optimization</h3>
              <p className="text-slate-600">
                System calculates the most efficient route based on all
                bookings.
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Driver Navigation</h3>
              <p className="text-slate-600">
                Drivers receive optimized routes with turn-by-turn directions.
              </p>
            </div>

            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Track Your Ride</h3>
              <p className="text-slate-600">
                Monitor bus location and get notified when your bus is
                approaching.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Locations */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Campus Locations</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Our smart bus system serves all major locations across the NIT
              Calicut campus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "East Campus Lecture Hall (ECLHC)", icon: "🏛️" },
              { name: "North Campus (NLHC)", icon: "🏢" },
              { name: "Central Library", icon: "📚" },
              { name: "Rajpath NITC", icon: "🛣️" },
              { name: "Department Building", icon: "🏫" },
              { name: "Main Building", icon: "🏤" },
              { name: "School of Management Studies (SOMS)", icon: "🏬" },
            ].map((location, index) => (
              <div
                key={index}
                className="flex items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="text-2xl mr-3">{location.icon}</span>
                <span className="font-medium">{location.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bus className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-white">NITC Smart Bus</h2>
              </div>
              <p className="text-slate-400">
                Optimizing campus transportation for efficiency and convenience.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li>National Institute of Technology Calicut</li>
                <li>NIT Campus P.O, Calicut</li>
                <li>Kerala, India - 673601</li>
                <li>support@nitcsmartbus.edu</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} NITC Smart Bus. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
