import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, User, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive(path) ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            BookBazzar
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/marketplace" className={navLinkClass("/marketplace")}>
            Buy Books
          </Link>
          <Link to="/add-listing" className={navLinkClass("/add-listing")}>
            Sell Books
          </Link>
          <Link to="/dashboard" className={navLinkClass("/dashboard")}>
            Dashboard
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/add-listing">
                <Button size="sm" className="rounded-full bg-primary px-5 font-semibold hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> List a Book
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/add-listing">
                <Button size="sm" className="rounded-full bg-primary px-5 font-semibold hover:bg-primary/90">
                  <Plus className="h-4 w-4" /> List a Book
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/marketplace" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Buy Books</Button>
            </Link>
            <Link to="/add-listing" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Sell Books</Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            {user ? (
              <>
                <Link to="/add-listing" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-full bg-primary"><Plus className="h-4 w-4" /> List a Book</Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-full bg-primary">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
