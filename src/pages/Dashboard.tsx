import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number | null;
  is_swap: boolean;
  condition: string;
  category: string;
  image_url: string | null;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  created_at: string;
  books: { title: string; author: string } | null;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [booksRes, txRes] = await Promise.all([
      supabase.from("books").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("transactions").select("*, books(title, author)").or(`seller_id.eq.${user!.id},buyer_id.eq.${user!.id}`).order("created_at", { ascending: false }),
    ]);

    if (booksRes.data) setMyBooks(booksRes.data as Book[]);
    if (txRes.data) setTransactions(txRes.data as unknown as Transaction[]);
    setLoading(false);
  };

  const deleteBook = async (bookId: string) => {
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMyBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast({ title: "Deleted", description: "Your listing has been removed." });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Manage your listings and history</p>
        </div>
        <Link to="/add-listing">
          <Button variant="hero" size="sm">
            <Plus className="h-4 w-4" /> New Listing
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings ({myBooks.length})</TabsTrigger>
          <TabsTrigger value="history">Swap History ({transactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {myBooks.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You haven't listed any books yet.</p>
                <Link to="/add-listing">
                  <Button variant="hero" className="mt-4"><Plus className="h-4 w-4" /> Add Your First Book</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {myBooks.map((book) => (
                <div key={book.id} className="relative">
                  <BookCard
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    price={book.price}
                    isSwap={book.is_swap}
                    condition={book.condition}
                    category={book.category}
                    imageUrl={book.image_url}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
                    style={{ opacity: 1 }}
                    onClick={() => deleteBook(book.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {transactions.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No transactions yet. Start swapping!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.id} className="shadow-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-foreground">{tx.books?.title ?? "Unknown Book"}</p>
                      <p className="text-sm text-muted-foreground">{tx.books?.author} · {tx.type}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      tx.status === "completed" ? "bg-success/10 text-success" :
                      tx.status === "pending" ? "bg-accent/20 text-accent-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {tx.status}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
