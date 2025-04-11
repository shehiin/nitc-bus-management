import React, { useRef, useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  apiKey: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  mapTypeId?: google.maps.MapTypeId;
  markers?: Array<{
    position: google.maps.LatLngLiteral;
    title?: string;
    icon?: string;
    isSelected?: boolean;
  }>;
  polylines?: Array<{
    path: google.maps.LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }>;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (marker: google.maps.Marker, index: number) => void;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 11.3218, lng: 75.9336 }, // NIT Calicut coordinates as default
  zoom = 15,
  mapTypeId = "roadmap",
  markers = [],
  polylines = [],
  onMapClick,
  onMarkerClick,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is required");
      setLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        const google = await loader.load();

        if (mapRef.current && !mapInstance) {
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId:
              mapTypeId === "satellite"
                ? google.maps.MapTypeId.SATELLITE
                : google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true,
          });

          if (onMapClick) {
            map.addListener("click", onMapClick);
          }

          setMapInstance(map);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load Google Maps");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      // Cleanup
      if (mapInstance) {
        // Remove event listeners if needed
        google.maps.event.clearInstanceListeners(mapInstance);
      }
    };
  }, [apiKey]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setCenter(center);
      mapInstance.setZoom(zoom);
      mapInstance.setMapTypeId(
        mapTypeId === "satellite"
          ? google.maps.MapTypeId.SATELLITE
          : google.maps.MapTypeId.ROADMAP,
      );
    }
  }, [mapInstance, center, zoom, mapTypeId]);

  // Handle markers
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstance,
        title: markerData.title,
        icon: markerData.isSelected
          ? {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 8,
            }
          : markerData.icon,
        animation: markerData.isSelected ? google.maps.Animation.BOUNCE : null,
      });

      if (onMarkerClick) {
        marker.addListener("click", () => onMarkerClick(marker, index));
      }

      markerRefs.current.push(marker);
    });
  }, [mapInstance, markers, onMarkerClick]);

  // Handle polylines
  useEffect(() => {
    if (!mapInstance) return;

    const polylineInstances: google.maps.Polyline[] = [];

    polylines.forEach((polylineData) => {
      const polyline = new google.maps.Polyline({
        path: polylineData.path,
        strokeColor: polylineData.strokeColor || "#3b82f6",
        strokeOpacity: polylineData.strokeOpacity || 0.8,
        strokeWeight: polylineData.strokeWeight || 3,
        map: mapInstance,
      });

      polylineInstances.push(polyline);
    });

    return () => {
      // Clean up polylines
      polylineInstances.forEach((polyline) => polyline.setMap(null));
    };
  }, [mapInstance, polylines]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md text-center">
            <p className="font-medium">Error loading map</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-full rounded-md overflow-hidden"
      ></div>
    </div>
  );
};

export default GoogleMap;
