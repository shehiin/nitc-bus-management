import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Bus, AlertCircle } from "lucide-react";
import MapView from "./MapView";
import { useToast } from "@/components/ui/use-toast";

interface BookingType {
  id: string;
  location: string;
  date: Date;
  time: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

const StudentDashboard = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<string | null>(null);

  const [busLocation, setBusLocation] = useState({
    lat: 11.3232,
    lng: 75.9336,
    eta: "10 minutes",
  });

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
        // Get student profile
        const { data: studentData } = await supabase
          .from("students")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (studentData) {
          setStudentId(studentData.id);
          fetchBookings(studentData.id);
        }
      }

      setLoading(false);
    };

    getCurrentUser();
  }, []);

  const fetchBookings = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_id", studentId);

      if (error) throw error;

      if (data) {
        const formattedBookings = data.map((booking) => ({
          id: booking.id,
          location: booking.location,
          date: new Date(booking.date),
          time: booking.time,
          status: booking.status as
            | "scheduled"
            | "in-progress"
            | "completed"
            | "cancelled",
        }));

        setBookings(formattedBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const campusLocations = [
    { value: "ECLHC", label: "East Campus Lecture Hall (ECLHC)" },
    { value: "NLHC", label: "North Campus (NLHC)" },
    { value: "Central Library", label: "Central Library" },
    { value: "Rajpath NITC", label: "Rajpath NITC" },
    { value: "Department Building", label: "Department Building" },
    { value: "Main Building", label: "Main Building" },
    { value: "SOMS", label: "School of Management Studies (SOMS)" },
  ];

  const timeSlots = [
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId) return;

    const form = e.target as HTMLFormElement;
    const location = (form.elements.namedItem("location") as HTMLInputElement)
      .value;
    const time = (form.elements.namedItem("time") as HTMLInputElement).value;

    if (location && time && date) {
      try {
        // Insert booking into Supabase
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            student_id: studentId,
            location,
            date: date.toISOString(),
            time,
            status: "scheduled",
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newBooking: BookingType = {
            id: data.id,
            location: data.location,
            date: new Date(data.date),
            time: data.time,
            status: data.status as
              | "scheduled"
              | "in-progress"
              | "completed"
              | "cancelled",
          };

          setBookings([...bookings, newBooking]);
          form.reset();
        }
      } catch (error) {
        console.error("Error creating booking:", error);
      }
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      // Update booking status in Supabase
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setBookings(
        bookings.map((booking) =>
          booking.id === id ? { ...booking, status: "cancelled" } : booking,
        ),
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        <Tabs defaultValue="book">
          <TabsList className="mb-6">
            <TabsTrigger value="book">Book a Ride</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="track">Track Bus</TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book a Bus Stop</CardTitle>
                  <CardDescription>
                    Select your pickup location and time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Pickup Location</Label>
                      <Select name="location" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {campusLocations.map((location) => (
                            <SelectItem
                              key={location.value}
                              value={location.value}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Pickup Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Pickup Time</Label>
                      <Select name="time" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full">
                      Book Ride
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campus Map</CardTitle>
                  <CardDescription>
                    View available pickup locations
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <MapView
                    userType="student"
                    bookings={bookings.filter((b) => b.status !== "cancelled")}
                    busLocation={busLocation}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Manage your scheduled rides</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{booking.location}</h3>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              <span>{format(booking.date, "PPP")}</span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(booking.status)} text-white`}
                          >
                            {booking.status.charAt(0).toUpperCase() +
                              booking.status.slice(1)}
                          </Badge>
                          {booking.status === "scheduled" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
                              className="ml-auto md:ml-0"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium">No bookings yet</h3>
                    <p className="text-muted-foreground">
                      Book a ride to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Live Bus Tracking</CardTitle>
                    <CardDescription>
                      Track your bus in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[500px]">
                    <MapView
                      userType="student"
                      bookings={bookings.filter(
                        (b) => b.status !== "cancelled",
                      )}
                      busLocation={busLocation}
                      showBusLocation={true}
                    />
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Bus Status</CardTitle>
                    <CardDescription>Current location and ETA</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">Campus Shuttle</h3>
                            <p className="text-sm text-muted-foreground">
                              Bus #1
                            </p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Current Location:
                            </span>
                            <span className="font-medium">
                              Near Main Building
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              ETA to your stop:
                            </span>
                            <span className="font-medium">
                              {busLocation.eta}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-green-500 text-white"
                            >
                              On Route
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-amber-50">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-amber-800">
                              Service Notice
                            </h3>
                            <p className="text-sm text-amber-700">
                              Bus may be delayed by 5 minutes due to traffic
                              near Central Library.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">
                          Next Scheduled Stops
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>ECLHC</span>
                            <span className="text-sm text-muted-foreground">
                              08:15
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Central Library</span>
                            <span className="text-sm text-muted-foreground">
                              08:25
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>NLHC</span>
                            <span className="text-sm text-muted-foreground">
                              08:40
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
