import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategories, type CategoryRecord } from "@/lib/categories";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Categories | Baddies";
    let cancelled = false;
    listCategories()
      .then((rows) => {
        if (!cancelled) setCategories(rows);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-white text-glow tracking-tight">
            Categories
          </h1>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {loading &&
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                  <Skeleton className="h-3 w-1/2 mx-auto" />
                </div>
              ))}

            {!loading &&
              !error &&
              categories.map((c) => <CategoryCard key={c.id} category={c} />)}
          </div>

          {error && (
            <p className="mt-10 text-center text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && categories.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No categories yet.</p>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="mt-8 text-right text-sm text-muted-foreground">
              {categories.length} categories
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CategoriesPage;