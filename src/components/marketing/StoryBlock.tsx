import { ScrollFadeIn } from "./ScrollFadeIn";

export function StoryBlock() {
  return (
    <section className="bg-sable py-20 md:py-28" aria-labelledby="story-title">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text column */}
          <ScrollFadeIn>
            <div>
              <p className="font-hand text-kraft text-xl mb-3">
                La maison
              </p>
              <h2
                id="story-title"
                className="font-display text-marine text-4xl sm:text-5xl uppercase leading-tight mb-6"
              >
                Une cabane,
                <br />
                des huîtres,
                <br />
                du grand vent.
              </h2>
              <div className="space-y-4 text-encre/80 leading-relaxed">
                <p>
                  Au bord du lac de Grand-Lieu, là où les aigrettes rasent l&apos;eau
                  à l&apos;aurore, la famille Moreau élève ses huîtres depuis quatre
                  décennies. Une tradition transmise de mains en mains, dans
                  le respect du rythme des marées et des saisons.
                </p>
                <p>
                  Chaque huître que vous dégustez ici a grandi dans nos parcs,
                  à quelques centaines de mètres de votre table. Pas d&apos;intermédiaire,
                  pas de compromis : du parc directement à votre assiette, le matin
                  même de leur ouverture.
                </p>
                <p>
                  La Dégust&apos; du Grand Coin, c&apos;est une table simple, un accueil
                  sincère, et des produits dont nous sommes fiers. Venez goûter
                  ce que le marais vendéen a de meilleur.
                </p>
              </div>

              {/* Accent manuscrit */}
              <p className="font-hand text-marine text-3xl mt-8">
                depuis 1987
              </p>
            </div>
          </ScrollFadeIn>

          {/* Image column */}
          <ScrollFadeIn delay={150}>
            <div className="relative">
              <div
                className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-kraft/20"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=800&auto=format&fit=crop&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label="Producteur d&apos;huîtres au travail sur son parc"
              />
              {/* Decorative kraft border */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border-2 border-kraft/40 -z-10" />
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
