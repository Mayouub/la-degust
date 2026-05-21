import { ScrollFadeIn } from "./ScrollFadeIn";
import type { CategoryWithProducts } from "@/lib/db/queries/products";

interface Props {
  catalog: CategoryWithProducts[];
}

function formatPrice(cents: number): string {
  const euros = cents / 100;
  if (euros % 1 === 0) return `${euros} €`;
  return `${euros.toFixed(2).replace(".", ",")} €`;
}

export function MenuBlock({ catalog }: Props) {
  if (catalog.length === 0) return null;

  return (
    <section
      id="menu"
      className="bg-papier py-20 md:py-28"
      aria-labelledby="menu-title"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <div className="mb-12 text-center">
            <p className="font-hand text-kraft text-xl mb-2">À la carte</p>
            <h2
              id="menu-title"
              className="font-display text-marine text-4xl sm:text-5xl uppercase leading-tight"
            >
              Notre Sélection
            </h2>
            <p className="text-encre/60 mt-3 text-sm max-w-md mx-auto">
              Tous nos produits sont élevés dans nos parcs et ouverts le jour
              même. Prix par unité sauf mention.
            </p>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          {catalog.map((cat, i) => (
            <ScrollFadeIn key={cat.id} delay={i * 80}>
              <div className="bg-sable/60 rounded-2xl p-6 sm:p-8 border border-kraft/30">
                {/* Category header */}
                <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-kraft/40">
                  <h3 className="font-display text-marine text-2xl sm:text-3xl uppercase">
                    {cat.name}
                  </h3>
                </div>

                {/* Products */}
                <ul className="space-y-3" aria-label={`Produits : ${cat.name}`}>
                  {cat.products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-baseline justify-between gap-4 py-2 border-b border-kraft/20 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-encre">
                          {product.name}
                        </span>
                        {product.unit_label && (
                          <span className="ml-2 text-encre/50 text-sm">
                            {product.unit_label}
                          </span>
                        )}
                        {product.description && (
                          <p className="text-encre/50 text-xs mt-0.5 leading-snug">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <span className="font-display text-marine text-xl shrink-0 tabular-nums">
                        {formatPrice(product.price_cents)}
                      </span>
                    </li>
                  ))}
                  {cat.products.length === 0 && (
                    <li className="text-encre/40 text-sm italic">
                      Aucun produit disponible actuellement.
                    </li>
                  )}
                </ul>
              </div>
            </ScrollFadeIn>
          ))}
        </div>

        <ScrollFadeIn delay={200}>
          <p className="text-center text-encre/40 text-xs mt-10">
            La carte peut évoluer selon les arrivages. Nos prix sont TTC.
          </p>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
