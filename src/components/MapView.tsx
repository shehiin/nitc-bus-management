import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MapPin,
  Navigation,
  Bus,
  LocateFixed,
  Route,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import GoogleMap from "./GoogleMap";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  isStop?: boolean;
}

interface RoutePoint {
  location: Location;
  arrivalTime?: string;
  studentsCount?: number;
  students?: string[];
}

interface MapViewProps {
  userType?: "student" | "driver";
  currentLocation?: { lat: number; lng: number };
  selectedStop?: string;
  routePoints?: RoutePoint[];
  onSelectStop?: (stop: Location) => void;
  onRefreshRoute?: () => void;
  busLocation?: { lat: number; lng: number; eta?: string };
  showBusLocation?: boolean;
  bookings?: any[];
}

const MapView = ({
  userType = "student",
  currentLocation = { lat: 11.3218, lng: 75.9336 }, // NIT Calicut coordinates
  selectedStop,
  routePoints = [],
  onSelectStop = () => {},
  onRefreshRoute = () => {},
  busLocation = { lat: 11.3228, lng: 75.9346, eta: "10 mins" },
  showBusLocation = false,
  bookings = [],
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapView, setMapView] = useState<"satellite" | "map">("map");
  const [isLoading, setIsLoading] = useState(false);
  const [campusLocations, setCampusLocations] = useState<Location[]>([]);
  const [displayedRoutePoints, setDisplayedRoutePoints] = useState<
    RoutePoint[]
  >([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [polylinePath, setPolylinePath] = useState<google.maps.LatLngLiteral[]>(
    [],
  );
  const [markers, setMarkers] = useState<
    Array<{
      position: google.maps.LatLngLiteral;
      title: string;
      isSelected: boolean;
    }>
  >([]);

  // Fetch campus locations from Supabase
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from("stops").select("*");

        if (error) throw error;

        if (data && data.length > 0) {
          const locations: Location[] = data.map((stop) => ({
            id: stop.id,
            name: stop.location,
            address: stop.address,
            lat: stop.lat,
            lng: stop.lng,
            isStop: stop.is_stop,
          }));

          setCampusLocations(locations);
        } else {
          // Fallback locations array
          const fallbackLocations: Location[] = [
            // ... (same array data)
          ];
          setCampusLocations(fallbackLocations);

          // Properly handle async insertions
          fallbackLocations.forEach((location) => {
            supabase
              .from("stops")
              .insert({
                location: location.name,
                address: location.address,
                lat: location.lat,
                lng: location.lng,
                is_stop: location.isStop,
              })
              .then(({ error }) => {
                if (error) console.error("Error inserting location:", error);
              });
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        // Fallback locations array
        const fallbackLocations: Location[] = [
          // ... (same array data)
        ];
        setCampusLocations(fallbackLocations);

        // Properly handle async insertions
        fallbackLocations.forEach((location) => {
          supabase
            .from("stops")
            .insert({
              location: location.name,
              address: location.address,
              lat: location.lat,
              lng: location.lng,
              is_stop: location.isStop,
            })
            .then(({ error }) => {
              if (error) console.error("Error inserting location:", error);
            });
        });
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Update displayed route points when campusLocations or routePoints change
  useEffect(() => {
    if (routePoints.length > 0) {
      setDisplayedRoutePoints(routePoints);
    } else if (campusLocations.length > 0) {
      // Create default route points if none provided and we have campus locations
      const defaultRoutePoints: RoutePoint[] = [
        {
          location: campusLocations[0] || {
            id: "1",
            name: "East Campus Lecture Hall - ECLHC",
            address: "ECLHC, NIT Calicut",
            lat: 11.3218,
            lng: 75.9336,
            isStop: true,
          },
          arrivalTime: "08:30 AM",
          studentsCount: 3,
          students: ["Mohammed Shehin", "Dhanus Raghav", "Ch. Vinitha"],
        },
        {
          location: campusLocations[2] || {
            id: "3",
            name: "Central Library",
            address: "Central Library, NIT Calicut",
            lat: 11.3208,
            lng: 75.9326,
            isStop: true,
          },
          arrivalTime: "08:45 AM",
          studentsCount: 2,
          students: ["G. Niteesha", "Anoop KP"],
        },
        {
          location: campusLocations[5] || {
            id: "6",
            name: "Main Building",
            address: "Main Building, NIT Calicut",
            lat: 11.3178,
            lng: 75.9296,
            isStop: true,
          },
          arrivalTime: "09:00 AM",
          studentsCount: 0,
          students: [],
        },
      ];
      setDisplayedRoutePoints(defaultRoutePoints);
    }
  }, [campusLocations, routePoints]);

  // Update markers when campus locations change
  useEffect(() => {
    if (campusLocations.length > 0) {
      const newMarkers = campusLocations.map((location) => ({
        position: { lat: location.lat, lng: location.lng },
        title: location.name,
        isSelected: selectedStop === location.name,
      }));

      // Add bus location marker if showing bus location
      if (userType === "student" && showBusLocation) {
        newMarkers.push({
          position: { lat: busLocation.lat, lng: busLocation.lng },
          title: "Bus Location",
          isSelected: false,
        });
      }

      setMarkers(newMarkers);
    }
  }, [campusLocations, selectedStop, busLocation, showBusLocation, userType]);

  // Update polyline path when route points change
  useEffect(() => {
    if (displayedRoutePoints.length > 1) {
      const path = displayedRoutePoints.map((point) => ({
        lat: point.location.lat,
        lng: point.location.lng,
      }));
      setPolylinePath(path);
    }
  }, [displayedRoutePoints]);

  // Handle refreshing the route
  const handleRefreshRoute = () => {
    setIsLoading(true);
    // Refresh the map data
    onRefreshRoute();
    setIsLoading(false);
  };

  // Handle map errors
  const handleMapError = (error: string) => {
    setMapError(error);
    console.error("Google Maps error:", error);
  };

  return (
    <Card className="w-full h-full overflow-hidden bg-background border rounded-xl shadow-md">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Bus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">
            {userType === "student" ? "Campus Bus Map" : "Driver Route Map"}
          </h3>
          {userType === "driver" && (
            <Badge variant="outline" className="ml-2">
              {displayedRoutePoints.length} Stops
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Tabs defaultValue="map" className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" onClick={() => setMapView("map")}>
                Map
              </TabsTrigger>
              <TabsTrigger
                value="satellite"
                onClick={() => setMapView("satellite")}
              >
                Satellite
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshRoute}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh route</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="relative w-full h-[500px]">
        {mapError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        <GoogleMap
          apiKey={
            import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
            process.env.VITE_GOOGLE_MAPS_API_KEY ||
            ""
          }
          center={currentLocation}
          zoom={15}
          mapTypeId={mapView === "satellite" ? "satellite" : "roadmap"}
          markers={markers}
          polylines={[
            {
              path: polylinePath,
              strokeColor: "#3b82f6",
              strokeOpacity: 0.8,
              strokeWeight: 3,
            },
          ]}
          onMapClick={(e) => console.log("Map clicked at", e.latLng?.toJSON())}
          onMarkerClick={(marker, index) => {
            const location = campusLocations[index];
            if (location) {
              onSelectStop(location);
            }
          }}
          className="w-full h-full rounded-md overflow-hidden"
        />

        {/* Map controls overlay */}
        <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md"
                >
                  <LocateFixed className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Center on current location</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {userType === "driver" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full shadow-md"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Start navigation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Route information panel for driver view */}
      {userType === "driver" && (
        <div className="p-4 border-t max-h-[200px] overflow-y-auto">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Route className="h-4 w-4 mr-2" />
            Route Information
          </h4>
          <div className="space-y-2">
            {displayedRoutePoints.map((point, index) => (
              <div
                key={`info-${point.location.id}`}
                className="flex justify-between items-start p-2 rounded-md hover:bg-muted"
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs mr-2">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{point.location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Arrival: {point.arrivalTime}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={point.studentsCount ? "default" : "outline"}>
                    {point.studentsCount} students
                  </Badge>
                  {point.studentsCount > 0 && point.students && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {point.students.slice(0, 2).join(", ")}
                      {point.students.length > 2 &&
                        ` +${point.students.length - 2} more`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ETA information for student view */}
      {userType === "student" && selectedStop && (
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium">Selected Stop</h4>
              <p className="text-base">{selectedStop}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-right">
                Estimated Arrival
              </h4>
              <p className="text-base text-primary font-medium">
                {busLocation.eta}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MapView;
