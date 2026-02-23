import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, BookOpen, X, Sparkles } from "lucide-react";
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
  user_id: string; 
  profiles: { username: string | null } | null;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Books");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const { data } = await supabase
      .from("books")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });
    if (data) setBooks(data as unknown as Book[]);
  };

  // Functional Filter Logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All Books" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search Header - Distinct from background */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b py-4">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-2xl">
            <div className={`relative transition-all duration-300 ${isSearching ? "scale-105" : "scale-100"}`}>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <Input
                placeholder="What book are you looking for?"
                value={searchQuery}
                className="h-12 rounded-full border-primary/20 bg-muted/30 pl-12 pr-12 text-base ring-offset-background transition-all focus:bg-card focus:ring-2 focus:ring-primary/20"
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-20 text-center bg-gradient-to-b from-primary/5 to-background">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl font-display">
            Find Your Next <span className="text-primary">Chapter.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Connect with students to buy, sell, or swap engineering books.
          </p>
        </motion.div>
      </section>

      {/* Sticky Categories Bar */}
<div className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-sm border-b mb-6">
  <div className="container mx-auto px-4">
    <div 
      className="flex items-center space-x-2 py-4 overflow-x-auto scrollbar-hide select-none"
      style={{
        msOverflowStyle: 'none',  /* IE and Edge */
        scrollbarWidth: 'none',   /* Firefox */
      }}
    >
      {/* Webkit specific styling for Chrome/Safari is usually handled in CSS, 
          but adding a wrapper div helps prevent layout shifts */}
      <div className="flex space-x-2 min-w-max pb-1"> 
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>

      {/* Book Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            {searchQuery ? "Search Results" : "Latest Listings"}
          </h2>
          {!searchQuery && (
            <Link to="/marketplace" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No books found matching your criteria.</p>
            <Button variant="outline" className="mt-4 rounded-full" onClick={() => {setSearchQuery(""); setSelectedCategory("All Books");}}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
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
                sellerId={book.user_id} // Crucial for "Buy Now" button
                username={book.profiles?.username ?? "User"}
              />
            ))}
          </div>
        )}
      </section>

      {/* Backdrop for searching focus */}
      <AnimatePresence>
        {isSearching && !searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearching(false)}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;