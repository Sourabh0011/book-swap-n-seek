import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

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
      <Card className="group overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="font-display text-4xl text-muted-foreground/30">📚</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            {isSwap ? (
              <Badge className="bg-swap text-swap-foreground">Swap</Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground">₹{price}</Badge>
            )}
            <Badge variant="outline" className="text-xs">{condition}</Badge>
          </div>
          <h3 className="font-display text-sm font-semibold leading-tight text-foreground line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{author}</p>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">{category}</Badge>
            {username && <span className="text-xs text-muted-foreground">by {username}</span>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookCard;
