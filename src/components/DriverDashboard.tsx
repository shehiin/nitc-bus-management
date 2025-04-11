import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  RotateCw,
  Users,
} from "lucide-react";
import MapView from "./MapView";
import { useToast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  name: string;
  pickupLocation: string;
  pickupTime: string;
  status: "pending" | "picked" | "missed";
}

interface Stop {
  id: string;
  location: string;
  time: string;
  students: Student[];
  completed: boolean;
}

interface MapViewStop {
  id: string;
  name: string;
  completed: boolean;
}

const DriverDashboard = () => {
  const { toast } = useToast();
  const [stops, setStops] = useState<Stop[]>([
    {
      id: "1",
      location: "East Campus Lecture Hall - ECLHC",
      time: "8:00 AM",
      completed: false,
      students: [
        {
          id: "1",
          name: "Mohammed Shehin",
          pickupLocation: "East Campus Lecture Hall - ECLHC",
          pickupTime: "8:00 AM",
          status: "pending",
        },
        {
          id: "2",
          name: "Dhanus Raghav",
          pickupLocation: "East Campus Lecture Hall - ECLHC",
          pickupTime: "8:00 AM",
          status: "pending",
        },
      ],
    },
    {
      id: "2",
      location: "Central Library",
      time: "8:15 AM",
      completed: false,
      students: [
        {
          id: "3",
          name: "Ch. Vinitha",
          pickupLocation: "Central Library",
          pickupTime: "8:15 AM",
          status: "pending",
        },
      ],
    },
    {
      id: "3",
      location: "Department Building",
      time: "8:30 AM",
      completed: false,
      students: [
        {
          id: "4",
          name: "G. Niteesha",
          pickupLocation: "Department Building",
          pickupTime: "8:30 AM",
          status: "pending",
        },
        {
          id: "5",
          name: "Anoop KP",
          pickupLocation: "Department Building",
          pickupTime: "8:30 AM",
          status: "pending",
        },
      ],
    },
  ]);

  const [activeStop, setActiveStop] = useState<string>(stops[0]?.id || "");
  const [routeStarted, setRouteStarted] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    "New booking: Anoop KP at Department Building",
    "Route optimized: 3 stops in total",
  ]);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);

  // Check if Google Maps API key is available
  useEffect(() => {
    const apiKey =
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "Google Maps API Key Missing",
        description:
          "Please add a valid Google Maps API key to your environment variables.",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get driver profile
        const { data: driverData } = await supabase
          .from("drivers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (driverData) {
          setDriverId(driverData.id);
          // In a real implementation, we would fetch stops based on driver ID
          // fetchStops(driverData.id);
        }
      }
    };

    getCurrentUser();
  }, []);

  // Function to mark a student as picked up
  const markStudentAsPickedUp = async (stopId: string, studentId: string) => {
    try {
      // Update booking status in Supabase
      const { error } = await supabase
        .from("bookings")
        .update({ status: "in-progress" })
        .eq("id", studentId);

      if (error) throw error;

      setStops((prevStops) =>
        prevStops.map((stop) => {
          if (stop.id === stopId) {
            return {
              ...stop,
              students: stop.students.map((student) => {
                if (student.id === studentId) {
                  return { ...student, status: "picked" as const };
                }
                return student;
              }),
            };
          }
          return stop;
        }),
      );
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  // Function to mark a student as missed
  const markStudentAsMissed = async (stopId: string, studentId: string) => {
    try {
      // Update booking status in Supabase
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", studentId);

      if (error) throw error;

      setStops((prevStops) =>
        prevStops.map((stop) => {
          if (stop.id === stopId) {
            return {
              ...stop,
              students: stop.students.map((student) => {
                if (student.id === studentId) {
                  return { ...student, status: "missed" as const };
                }
                return student;
              }),
            };
          }
          return stop;
        }),
      );
    } catch (error) {
      console.error("Error updating student status:", error);
    }
  };

  // Function to mark a stop as completed
  const markStopAsCompleted = async (stopId: string) => {
    try {
      // In a real app, we would update the route status in Supabase
      // For now, just update the local state
      setStops((prevStops) =>
        prevStops.map((stop) => {
          if (stop.id === stopId) {
            return { ...stop, completed: true };
          }
          return stop;
        }),
      );

      // Move to next stop if available
      const currentStopIndex = stops.findIndex((stop) => stop.id === stopId);
      if (currentStopIndex < stops.length - 1) {
        setActiveStop(stops[currentStopIndex + 1].id);
      }
    } catch (error) {
      console.error("Error marking stop as completed:", error);
    }
  };

  // Function to start the route
  const startRoute = () => {
    setRouteStarted(true);
    setNotifications((prev) => [
      "Route started. Navigating to first stop: " + stops[0]?.location,
      ...prev,
    ]);
  };

  // Function to refresh route
  const refreshRoute = async () => {
    setLoading(true);
    // In a real implementation, we would fetch updated route data from Supabase
    // await fetchStops(driverId);
    setNotifications((prev) => [
      "Route refreshed. Checking for new bookings...",
      ...prev,
    ]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Driver Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            {!routeStarted ? (
              <Button onClick={startRoute} className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Start Route
              </Button>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300 px-3 py-1"
              >
                <Clock className="h-4 w-4 mr-1" />
                Route in Progress
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={refreshRoute}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RotateCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Route
            </Button>
          </div>
        </div>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList>
            <TabsTrigger value="map">Route Map</TabsTrigger>
            <TabsTrigger value="stops">Stops & Students</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Route Map</CardTitle>
                  <CardDescription>
                    Optimized route with {stops.length} stops.{" "}
                    {routeStarted
                      ? "Currently in progress."
                      : "Ready to start."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] w-full bg-muted rounded-md overflow-hidden">
                    <MapView
                      userType="driver"
                      selectedStop={
                        stops.find((stop) => stop.id === activeStop)?.location
                      }
                      routePoints={stops.map((stop) => ({
                        location: {
                          id: stop.id,
                          name: stop.location,
                          address: stop.location,
                          lat: 11.3218 + (Math.random() * 0.01 - 0.005), // Generate random coordinates around NIT Calicut
                          lng: 75.9336 + (Math.random() * 0.01 - 0.005),
                          isStop: true,
                        },
                        arrivalTime: stop.time,
                        studentsCount: stop.students.length,
                        students: stop.students.map((s) => s.name),
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Stop</CardTitle>
                  <CardDescription>
                    {routeStarted
                      ? "Students to pick up at this stop"
                      : "Route not started yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {routeStarted ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {stops.find((stop) => stop.id === activeStop)
                            ?.location || "No active stop"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>
                          {stops.find((stop) => stop.id === activeStop)?.time ||
                            ""}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span>
                          {stops.find((stop) => stop.id === activeStop)
                            ?.students.length || 0}{" "}
                          students
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {stops
                          .find((stop) => stop.id === activeStop)
                          ?.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-2 rounded-md border"
                            >
                              <div className="flex items-center space-x-2">
                                <Avatar>
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                                  />
                                  <AvatarFallback>
                                    {student.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {student.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                {student.status === "pending" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-green-600"
                                      onClick={() =>
                                        markStudentAsPickedUp(
                                          activeStop,
                                          student.id,
                                        )
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-red-600"
                                      onClick={() =>
                                        markStudentAsMissed(
                                          activeStop,
                                          student.id,
                                        )
                                      }
                                    >
                                      <AlertCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Badge
                                    variant={
                                      student.status === "picked"
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {student.status === "picked"
                                      ? "Picked up"
                                      : "Missed"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => markStopAsCompleted(activeStop)}
                        disabled={
                          stops.find((stop) => stop.id === activeStop)
                            ?.completed
                        }
                      >
                        {stops.find((stop) => stop.id === activeStop)?.completed
                          ? "Stop Completed"
                          : "Mark Stop as Completed"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Navigation className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Click "Start Route" to begin navigation
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stops" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Stops & Students</CardTitle>
                <CardDescription>
                  Complete list of stops and students for today's route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {stops.map((stop) => (
                      <div key={stop.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${stop.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                            >
                              {stop.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{stop.location}</h3>
                              <p className="text-sm text-muted-foreground">
                                {stop.time}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={stop.completed ? "outline" : "secondary"}
                          >
                            {stop.completed ? "Completed" : "Pending"}
                          </Badge>
                        </div>

                        <div className="pl-10 space-y-2">
                          {stop.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-2 rounded-md border"
                            >
                              <div className="flex items-center space-x-2">
                                <Avatar>
                                  <AvatarImage
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                                  />
                                  <AvatarFallback>
                                    {student.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {student.name}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  student.status === "pending"
                                    ? "secondary"
                                    : student.status === "picked"
                                      ? "default"
                                      : "destructive"
                                }
                              >
                                {student.status === "pending"
                                  ? "Waiting"
                                  : student.status === "picked"
                                    ? "Picked up"
                                    : "Missed"}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {stop.id !== stops[stops.length - 1].id && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications & Updates</CardTitle>
                <CardDescription>
                  Real-time updates about route changes and bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 rounded-lg border"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <AlertCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">{notification}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(
                              Date.now() - index * 1000 * 60 * 5,
                            ).toLocaleTimeString()}{" "}
                            •{" "}
                            {new Date(
                              Date.now() - index * 1000 * 60 * 5,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;
