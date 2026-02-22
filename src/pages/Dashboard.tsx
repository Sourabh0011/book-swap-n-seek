import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Pencil, CheckCircle, Package, TrendingUp, MessageSquare, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Book {
  id: string;
  title: string;
  author: string;
  price: number | null;
  is_swap: boolean;
  condition: string;
  category: string;
  image_url: string | null;
  created_at: string;
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

  const totalEarned = myBooks.reduce((sum, b) => sum + (b.price ?? 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">User Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage your books and track your earnings.</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Ads</p>
            <p className="text-2xl font-bold text-foreground">{myBooks.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold text-foreground">₹{totalEarned.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Messages</p>
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-4 px-0">
          <TabsTrigger value="listings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none">
            My Listings
          </TabsTrigger>
          <TabsTrigger value="purchases" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none">
            My Purchases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {myBooks.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">You haven't listed any books yet.</p>
              <Link to="/add-listing">
                <Button className="mt-4 rounded-full bg-primary"><Plus className="h-4 w-4" /> Add Your First Book</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Book Details</span>
                <span>Price</span>
                <span>Status</span>
                <span>Views</span>
                <span className="text-right">Actions</span>
              </div>

              {myBooks.map((book) => (
                <div key={book.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center border-b last:border-0 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{book.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-foreground">
                    {book.is_swap ? "Swap" : `₹${book.price}`}
                  </p>
                  <span className="inline-flex w-fit rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Active
                  </span>
                  <p className="text-sm text-muted-foreground">—</p>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteBook(book.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          {transactions.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">No purchases yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card">
                  <div>
                    <p className="font-medium text-foreground">{tx.books?.title ?? "Unknown Book"}</p>
                    <p className="text-sm text-muted-foreground">{tx.books?.author} · {tx.type}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    tx.status === "completed" ? "bg-green-100 text-green-700" :
                    tx.status === "pending" ? "bg-amber-100 text-amber-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
