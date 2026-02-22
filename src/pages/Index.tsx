import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Repeat, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-books.jpg";

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Students exchanging books" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Swap & Save on <br />Student Books
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 md:text-xl">
              The peer-to-peer marketplace where students buy, sell, and swap textbooks. Save money, share knowledge.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/marketplace">
                <Button size="lg" className="bg-card text-foreground hover:bg-card/90 shadow-lg font-semibold">
                  Browse Books <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Start Selling
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: BookOpen, title: "Buy & Sell", desc: "List your used books or find affordable textbooks from fellow students." },
            { icon: Repeat, title: "Swap Books", desc: "Trade books you've finished for ones you need. No money required." },
            { icon: ShieldCheck, title: "Trusted Community", desc: "Verified student accounts keep the marketplace safe and reliable." },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="rounded-xl border bg-card p-6 shadow-card text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">
            Ready to declutter your bookshelf?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Join thousands of students saving money on textbooks.
          </p>
          <Link to="/auth">
            <Button size="lg" className="mt-6 bg-card text-foreground hover:bg-card/90 font-semibold shadow-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">BookBazzar</span>
          </div>
          <p>© 2026 BookBazzar. Made for students, by students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
