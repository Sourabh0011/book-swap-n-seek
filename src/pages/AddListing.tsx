import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";

const CATEGORIES = ["Engineering", "Arts", "Science", "Commerce", "Competitive Exams", "Literature", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const AddListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    isSwap: false,
    condition: "Good",
    category: "Other",
    description: "",
  });

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("book-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("books").insert({
        user_id: user.id,
        title: form.title,
        author: form.author,
        price: form.isSwap ? null : parseFloat(form.price),
        is_swap: form.isSwap,
        condition: form.condition,
        category: form.category,
        description: form.description,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({ title: "Listed!", description: "Your book is now on the marketplace." });
      navigate("/marketplace");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {step === 1 ? "Book Details" : step === 2 ? "Pricing & Condition" : "Add Photo"}
          </CardTitle>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Introduction to Algorithms" value={form.title} onChange={(e) => updateForm("title", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input placeholder="e.g. Thomas H. Cormen" value={form.author} onChange={(e) => updateForm("author", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea placeholder="Tell buyers about your book..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.title || !form.author}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label>Swap only?</Label>
                  <p className="text-sm text-muted-foreground">Toggle if you want to swap instead of sell</p>
                </div>
                <Switch checked={form.isSwap} onCheckedChange={(v) => updateForm("isSwap", v)} />
              </div>
              {!form.isSwap && (
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="e.g. 250" value={form.price} onChange={(e) => updateForm("price", e.target.value)} min="0" required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => updateForm("condition", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!form.isSwap && !form.price}>
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Book Photo (optional)</Label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button variant="hero" className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Listing..." : <><Check className="h-4 w-4" /> Publish</>}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddListing;
