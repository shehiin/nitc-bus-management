import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  Bus,
  Calendar,
  Home,
  LogOut,
  Map,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "student" | "driver";
  userName?: string;
}

const DashboardLayout = ({
  children,
  userRole = "student",
  userName = "User Name",
}: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentNavItems = [
    { name: "Dashboard", path: "/student", icon: <Home className="h-5 w-5" /> },
    {
      name: "Book Ride",
      path: "/student/book",
      icon: <Bus className="h-5 w-5" />,
    },
    {
      name: "My Schedule",
      path: "/student/schedule",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Track Bus",
      path: "/student/track",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/student/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const driverNavItems = [
    { name: "Dashboard", path: "/driver", icon: <Home className="h-5 w-5" /> },
    {
      name: "Route Map",
      path: "/driver/route",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "Stops List",
      path: "/driver/stops",
      icon: <Bus className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/driver/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const navItems = userRole === "student" ? studentNavItems : driverNavItems;

  const handleLogout = () => {
    // Handle logout logic here
    navigate("/");
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Smart Bus System</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        <div className="border-t p-4">
          <div
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              to="/"
              className="flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Bus className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Smart Bus System</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4 px-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
          <div className="border-t p-4">
            <div
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold md:text-xl">
              {userRole === "student"
                ? "Student Dashboard"
                : "Driver Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                  alt={userName}
                />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
