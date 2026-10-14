import heroStrip from "../data/heroStrip.json";

// Faint duotone event photos filling the homepage hero: a slightly tilted wall of columns drifting slowly up and down.
// It starts 5rem above the hero (-top-20, the space under the fixed navbar) so it continues behind the nav.
// A spotlight mask (.hero-photo-wall) keeps it quiet behind the logo, video and title and fades it out at the
// bottom, so it reads as texture rather than content. Thumbnails are pre-made by scripts/build-hero-strip.mjs.

const COLUMNS = 8;
const MIN_PHOTOS_PER_COPY = 8;

// Each track shows its photos twice and slides by exactly one copy, so the loop has no visible jump.
// A copy is repeated until it is long enough to cover the hero.
const copyOf = (photos: string[]) => {
  const copy = [...photos];
  while (copy.length < MIN_PHOTOS_PER_COPY) copy.push(...photos);
  return copy;
};

const columns = Array.from({ length: COLUMNS }, (_, c) => copyOf(heroStrip.filter((_, i) => i % COLUMNS === c)));

// columns past the visible count for the screen width are hidden (3 on phones up to 8 on large screens)
const columnVisibility = (c: number) =>
  c < 3 ? "" : c < 4 ? "hidden sm:block" : c < 5 ? "hidden md:block" : c < 7 ? "hidden lg:block" : "hidden xl:block";

export default function HeroPhotoColumns() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 -top-20 -bottom-40 overflow-hidden pointer-events-none hero-photo-wall">
      <div className="absolute -inset-[15%] flex gap-4 -rotate-6 opacity-[0.05]">
        {columns.map((photos, c) => (
          <div key={c} className={`flex-1 min-w-0 ${columnVisibility(c)}`}>
            <div
              className="hero-drift-y flex flex-col gap-4"
              style={{ animationDuration: `${150 + ((c * 17) % 60)}s`, animationDirection: c % 2 ? "reverse" : "normal" }}
            >
              {[...photos, ...photos].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/5] rounded-xl object-cover"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
