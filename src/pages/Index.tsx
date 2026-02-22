import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, BookOpen, Star, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BookCard from "@/components/BookCard";

const CATEGORIES = ["All Books", "CS", "Mech", "Civil", "Notes", "GATE", "Novels"];

interface Book {
  id: string;
  title: string;
  author: string;
  price: number | null;
  is_swap: boolean;
  condition: string;
  category: string;
  image_url: string | null;
  profiles: { username: string | null } | null;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Books");
  const recentSearches = ["Theory of Computation", "Discrete Maths", "Notes"];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false })
      .limit(8);
    if (data) setBooks(data as unknown as Book[]);
  };

  return (
    <div className="flex flex-col">
      {/* Search Section */}
      <div className="relative z-50 container mx-auto px-4 pt-6">
        <div className="relative mx-auto max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              className="h-12 rounded-full border-border bg-card pl-12 pr-12 text-base shadow-card"
              onFocus={() => setIsSearching(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <button
                onClick={() => { setIsSearching(false); setSearchQuery(""); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 right-0 top-14 z-50 rounded-2xl border bg-card p-4 shadow-lg"
              >
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> Recent Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isSearching && (
          <div
            onClick={() => setIsSearching(false)}
            className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-[2px]"
          />
        )}
      </div>

      {/* Hero Section */}
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground md:text-7xl">
              Unlock Knowledge,{" "}
              <span className="text-primary">Affordably.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground md:text-xl">
              The ultimate marketplace for students. Sell your old semesters' books and find what you need for the next one at half the price.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="container mx-auto px-4 py-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Featured Listings
          </h2>
          <Link to="/marketplace" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">No books listed yet. Be the first!</p>
            <Link to="/add-listing">
              <Button className="mt-4 rounded-full bg-primary">List a Book</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author}
                price={book.price}
                isSwap={book.is_swap}
                condition={book.condition}
                category={book.category}
                imageUrl={book.image_url}
                username={book.profiles?.username ?? undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">BookBazzar</span>
          </div>
          <p>© 2026 BookBazzar. Made for students, by students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
