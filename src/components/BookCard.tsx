import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Star } from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number | null;
  isSwap: boolean;
  condition: string;
  category: string;
  imageUrl: string | null;
  username?: string;
}

const BookCard = ({ title, author, price, isSwap, condition, category, imageUrl, username }: BookCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/50">
              <BookOpen className="h-10 w-10 text-primary/30" />
            </div>
          )}
          <Badge className="absolute right-2 top-2 bg-card text-foreground text-xs font-medium shadow-sm border-0">
            {condition}
          </Badge>
          {isSwap && (
            <Badge className="absolute left-2 top-2 bg-swap text-swap-foreground text-xs border-0">
              Swap
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-display text-sm font-semibold leading-tight text-foreground line-clamp-2">
            {title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            {isSwap ? (
              <span className="text-sm font-bold text-swap">Swap</span>
            ) : (
              <span className="text-sm font-bold text-foreground">₹{price}</span>
            )}
            <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              5.0
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookCard;
