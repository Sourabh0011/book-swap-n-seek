import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, CheckCircle, Package, TrendingUp, Bell, Clock, MapPin, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Book { id: string; title: string; author: string; price: number | null; is_swap: boolean; condition: string; category: string; image_url: string | null; created_at: string; }
interface Transaction { id: string; type: string; status: string; created_at: string; payment_method: string | null; address_line: string | null; city: string | null; state: string | null; pincode: string | null; phone: string | null; buyer_id: string; seller_id: string; books: { title: string; author: string; price: number | null } | null; buyer_profile?: { username: string | null } | null; }
interface Notification { id: string; title: string; message: string; is_read: boolean; created_at: string; related_transaction_id: string | null; }

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
        toast({ title: (payload.new as Notification).title, description: (payload.new as Notification).message });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchData = async () => {
    const [booksRes, txRes, notifRes] = await Promise.all([
      supabase.from("books").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("transactions").select("*, books(title, author, price)").or(`seller_id.eq.${user!.id},buyer_id.eq.${user!.id}`).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20),
    ]);

    if (booksRes.data) setMyBooks(booksRes.data as Book[]);
    if (txRes.data) setTransactions(txRes.data as unknown as Transaction[]);
    if (notifRes.data) setNotifications(notifRes.data as Notification[]);
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

  const updateOrderStatus = async (txId: string, status: string) => {
    const { error } = await supabase.from("transactions").update({ status }).eq("id", txId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === txId ? { ...t, status } : t)));
      toast({ title: "Updated", description: `Order marked as ${status}.` });
    }
  };

  const markNotifRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totalEarned = myBooks.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const incomingOrders = transactions.filter((t) => t.seller_id === user!.id);
  const myPurchases = transactions.filter((t) => t.buyer_id === user!.id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center md:text-left">User Dashboard</h1>
        <p className="mt-1 text-muted-foreground text-center md:text-left">Manage your books and track your earnings.</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Ads", val: myBooks.length, icon: <Package className="h-5 w-5 text-primary" />, bg: "bg-accent" },
          { label: "Total Earned", val: `₹${totalEarned.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5 text-green-600" />, bg: "bg-green-50" },
          { label: "Orders", val: incomingOrders.length, icon: <Package className="h-5 w-5 text-amber-600" />, bg: "bg-amber-50" },
          { label: "Notifications", val: unreadCount, icon: <Bell className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50" }
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <div className="relative border-b overflow-hidden">
          <TabsList className="flex w-full justify-start gap-6 bg-transparent rounded-none px-0 overflow-x-auto no-scrollbar whitespace-nowrap">
            <TabsTrigger value="listings" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none shrink-0">
              My Listings
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none shrink-0">
              Incoming Orders {incomingOrders.length > 0 && <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-[10px] justify-center">{incomingOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="purchases" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none shrink-0">
              My Purchases
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent px-1 pb-3 shadow-none shrink-0">
              Notifications {unreadCount > 0 && <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-[10px] justify-center bg-destructive text-white border-none">{unreadCount}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* My Listings Tab */}
        <TabsContent value="listings" className="mt-6">
          {myBooks.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">You haven't listed any books yet.</p>
              <Link to="/add-listing">
                <Button className="mt-4 rounded-full bg-primary"><Plus className="h-4 w-4 mr-2" /> Add Your First Book</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">
                <span>Book Details</span>
                <span>Price</span>
                <span>Status</span>
                <span>Views</span>
                <span className="text-right">Actions</span>
              </div>
              {myBooks.map((book) => (
                <div key={book.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-start md:items-center border-b last:border-0 px-6 py-4">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{book.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full justify-between items-center md:contents">
                    <p className="font-medium text-foreground"><span className="md:hidden text-xs text-muted-foreground block">Price</span>{book.is_swap ? "Swap" : `₹${book.price}`}</p>
                    <div className="md:block">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>
                    </div>
                    <p className="hidden md:block text-sm text-muted-foreground">—</p>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteBook(book.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"><CheckCircle className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Incoming Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          {incomingOrders.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">No incoming orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.books?.title ?? "Unknown Book"}</p>
                      <p className="text-sm text-muted-foreground">{order.books?.author} · ₹{order.books?.price}</p>
                    </div>
                    <Badge className={`rounded-full ${
                      order.status === "pending" ? "bg-amber-100 text-amber-700" :
                      order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  {order.address_line && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-accent/50 rounded-xl p-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div>
                        <p>{order.address_line}</p>
                        <p>{order.city}, {order.state} - {order.pincode}</p>
                        <p className="font-medium text-foreground">📞 {order.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {order.payment_method === "online" ? <><CreditCard className="h-4 w-4" /> Online</> : <><Banknote className="h-4 w-4" /> COD</>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {order.status === "pending" && (
                      <>
                        <Button size="sm" className="rounded-full" onClick={() => updateOrderStatus(order.id, "confirmed")}>Accept</Button>
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => updateOrderStatus(order.id, "cancelled")}>Cancel</Button>
                      </>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order.id, "completed")}>Mark Delivered</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Purchases Tab */}
        <TabsContent value="purchases" className="mt-6">
          {myPurchases.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">No purchases yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPurchases.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-card">
                  <div>
                    <p className="font-medium text-foreground">{tx.books?.title ?? "Unknown Book"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.payment_method === "online" ? "💳 Online" : "💵 Cash"} · {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className="rounded-full">{tx.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-card">
              <p className="text-muted-foreground">No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} onClick={() => !n.is_read && markNotifRead(n.id)} className={`rounded-2xl border p-4 cursor-pointer transition-all ${n.is_read ? "bg-card" : "bg-accent/50 border-primary/20"}`}>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
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