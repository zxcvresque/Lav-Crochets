// data.jsx — site config + crochet catalog content (categories + products).
// Real product art will be 1:1 photos dropped into assets/ later.
// Here, PrintArt SVG placeholders stand in. No em dashes anywhere.

// ── Business config ─────────────────────────────────────────────────────
// One place for every brand/contact value. Swap the TODOs as they arrive.
const CONFIG = {
  brandName: "Lav Crochets",
  wordmarkA: "lav",            // bold part of the split wordmark
  wordmarkB: "/crochets",      // muted part (same style as the original "/digital")
  tagline: "Handmade crochet, made with love.",
  city: "Chhatrapati Sambhajinagar, Maharashtra",

  // WhatsApp — international format, digits only (no + or spaces) for wa.me links.
  whatsappNumber: "91xxxxxxxxxx",
  whatsappDisplay: "+91 xxxxx xxxxx",

  // UPI — placeholder for now; drop a real id + a QR PNG into assets/upi-qr.png.
  upiId: "lavcrochets@upi",        // TODO: real UPI id
  upiQrImage: "assets/upi-qr.svg", // cute placeholder; swap for the real QR image (png/svg) later

  // Socials.
  instagramHandle: "@crochetsbylav",
  instagramUrl: "https://www.instagram.com/crochetsbylav",
  whatsappCatalogueUrl: "", // TODO optional: wa.me/c/<id> catalogue link

  supportEmail: "hello@lav-crochets.art",
  shippingNote: "Most pieces are delivered in about 4 to 5 days. For custom pieces, we confirm the making time over chat.",

  // Static Instagram grid (no API). TODO: add { img, url } tiles (drop thumbs in assets/).
  instagramPosts: [],
};

// ── Collections ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "charms",    title: "Bag charms",       count: 2, tone: "coral" },
  { id: "hair",      title: "Hair accessories", count: 3, tone: "joy"   },
  { id: "keychains", title: "Keychains",        count: 1, tone: "plum"  },
];

// ── Products (from CATALOGUE.md; photos in catalogue-images/<slug>.jpg) ─────
// shape: { id, slug, title, category, chip?('new'|'sale'|'pick'),
//          materials, sizeOptions[], colorOptions[], stockStatus('ready'|'made-to-order'),
//          turnaround, priceINR, wasINR?, care, img, artVariant, description }
// Prices are for the crochet item only; shipping is confirmed on WhatsApp.
const PRODUCTS = [
  {
    id: "p1", slug: "spiderman-bag-charm",
    title: "Spiderman Bag Charm",
    category: "charms",
    chip: "new",
    materials: "Cotton yarn, cord loop",
    sizeOptions: ["One size"],
    colorOptions: ["Red, black & white eyes, navy accent"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 400,
    care: "Spot clean only. Keep away from damp.",
    img: "catalogue-images/spiderman-bag-charm.jpg",
    artVariant: "hearts",
    description: "A crocheted Spider-Man head charm in bright red with the classic black web eye-patches and a small navy accent on top. Hangs from a white cord loop, ready to clip onto a tote or backpack."
  },
  {
    id: "p2", slug: "spiderman-gwen-couple-charm",
    title: "Spiderman & Gwen Couple Charm",
    category: "charms",
    chip: "pick",
    materials: "Cotton yarn, cord loops",
    sizeOptions: ["Set of two"],
    colorOptions: ["Red Spider-Man + pink Gwen"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 700,
    care: "Spot clean only. Keep away from damp.",
    img: "catalogue-images/spiderman-gwen-couple-charm.jpg",
    artVariant: "hearts",
    description: "A matching pair sold together: the red Spider-Man head and a pink Spider-Gwen head with white eye-patches outlined in pink. Each hangs from its own white cord, perfect as a couple or duo charm."
  },
  {
    id: "p3", slug: "plumeria-flower-clip",
    title: "Plumeria Flower Clip",
    category: "hair",
    materials: "Cotton yarn, hair clip",
    sizeOptions: ["One size"],
    colorOptions: ["White with pink centre"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 120,
    care: "Spot clean only. Reshape petals by hand.",
    img: "catalogue-images/plumeria-flower-clip.jpg",
    artVariant: "flower",
    description: "A single crocheted plumeria (frangipani) flower hair clip, white petals with a soft pink blush at the centre. Light and easy to clip into hair."
  },
  {
    id: "p4", slug: "tulip-headband",
    title: "Tulip Headband",
    category: "hair",
    chip: "new",
    materials: "Cotton yarn",
    sizeOptions: ["One size (ties to fit)"],
    colorOptions: ["Cream band, pink tulips, green leaves", "Custom on request"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 300,
    care: "Hand wash cold, reshape, dry flat.",
    img: "catalogue-images/tulip-headband.jpg",
    artVariant: "flower",
    description: "A cream headband with a row of raised 3D pink tulips and green leaves along the band. Finished with tie ends and a bow, plus a small tulip motif on each tie."
  },
  {
    id: "p5", slug: "daisy-headband",
    title: "Daisy Headband",
    category: "hair",
    materials: "Cotton yarn",
    sizeOptions: ["One size (stretch fit)"],
    colorOptions: ["White petals, yellow centres", "Custom on request"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 280,
    care: "Hand wash cold, reshape, dry flat.",
    img: "catalogue-images/daisy-headband.jpg",
    artVariant: "flower",
    description: "A headband of joined white daisies with yellow centres, worn across the head like a flower crown."
  },
  {
    id: "p6", slug: "strawberry-keychain",
    title: "Strawberry Keychain",
    category: "keychains",
    chip: "new",
    materials: "Cotton yarn, lobster clasp",
    sizeOptions: ["One size"],
    colorOptions: ["Pink strawberry, green leaf, white flower"],
    stockStatus: "ready",
    turnaround: "Delivered in 4 to 5 days",
    priceINR: 180,
    care: "Spot clean only.",
    img: "catalogue-images/strawberry-keychain.jpg",
    artVariant: "yarn",
    description: "A plump pink crocheted strawberry topped with a green leaf and a white five-petal flower, attached to a silver lobster clasp."
  },
];

// PrintArt: soft, crochet-flavoured SVG placeholders that suggest a handmade
// piece without faking a photo. Background cycles through the brand palette.
function PrintArt({ variant = "yarn", chip }) {
  const palettes = {
    "yarn":    { bg: "var(--joy-100)",  ink: "var(--joy-700)" },
    "flower":  { bg: "var(--rose-300)", ink: "var(--rose-700)" },
    "granny":  { bg: "var(--iris-300)", ink: "var(--iris-700)" },
    "stitch":  { bg: "var(--joy-200)",  ink: "var(--joy-800)" },
    "stripes": { bg: "var(--paper-3)",  ink: "var(--joy-700)" },
    "hearts":  { bg: "var(--sun-300)",  ink: "var(--rose-700)" },
    "bundle":  { bg: "var(--ink)",      ink: "var(--joy-300)" },
  };
  const p = palettes[variant] || palettes["yarn"];

  const layout = {
    // Ball of yarn with a loose curl.
    "yarn": (
      <g fill="none" stroke={p.ink} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="195" cy="205" r="120" strokeWidth="7" opacity=".8"/>
        <path d="M95 175 Q195 265 295 175" strokeWidth="5" opacity=".5"/>
        <path d="M100 240 Q195 170 290 250" strokeWidth="5" opacity=".5"/>
        <path d="M150 95 Q255 205 175 320" strokeWidth="5" opacity=".5"/>
        <path d="M300 250 C360 250 360 322 305 322 C272 322 272 286 305 286" strokeWidth="6" opacity=".7"/>
      </g>
    ),
    // A single crochet flower.
    "flower": (
      <g>
        {[0,60,120,180,240,300].map((a) => {
          const r = (a * Math.PI) / 180;
          const cx = 200 + 78 * Math.cos(r);
          const cy = 205 + 78 * Math.sin(r);
          return <circle key={a} cx={cx} cy={cy} r="52" fill={p.ink} opacity=".22"/>;
        })}
        <circle cx="200" cy="205" r="46" fill={p.ink} opacity=".7"/>
        <circle cx="200" cy="205" r="22" fill={p.bg}/>
      </g>
    ),
    // Four granny squares.
    "granny": (
      <g>
        {[[58,62],[230,62],[58,234],[230,234]].map(([x,y],i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect width="112" height="112" rx="10" fill="none" stroke={p.ink} strokeWidth="6" opacity=".7"/>
            <rect x="24" y="24" width="64" height="64" rx="8" fill="none" stroke={p.ink} strokeWidth="6" opacity=".5"/>
            <rect x="46" y="46" width="20" height="20" rx="5" fill={p.ink} opacity=".5"/>
          </g>
        ))}
      </g>
    ),
    // Chevron rows — ripple/V-stitch texture.
    "stitch": (
      <g stroke={p.ink} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".5">
        {[70,130,190,250,310,370].map((y, r) => (
          <g key={r}>
            {[0,1,2,3,4,5].map((c) => (
              <path key={c} d={`M${c*72} ${y} L${c*72+36} ${y-28} L${c*72+72} ${y}`}/>
            ))}
          </g>
        ))}
      </g>
    ),
    // Cozy blanket stripes.
    "stripes": (
      <g>
        {[...Array(8)].map((_, i) => (
          <rect key={i} x="0" y={i*50 + 6} width="400" height="34" fill={p.ink} opacity={0.14 + (i % 3) * 0.09}/>
        ))}
      </g>
    ),
    // Scattered hearts.
    "hearts": (
      <g fill={p.ink}>
        {[[110,130,1.1],[270,160,0.8],[170,255,1.3],[305,300,0.9],[80,310,0.7]].map(([x,y,s],i) => (
          <path key={i} transform={`translate(${x},${y}) scale(${s})`} opacity={0.3 + (i % 3) * 0.16}
            d="M0 4 C0 -4 -14 -8 -22 0 C-30 8 -22 18 0 34 C22 18 30 8 22 0 C14 -8 0 -4 0 4 Z"/>
        ))}
      </g>
    ),
    // Gift-set collage.
    "bundle": (
      <g>
        {[
          [40,40,150,90,"var(--joy-500)"],
          [210,40,150,150,"var(--rose-500)"],
          [40,150,150,210,"var(--iris-500)"],
          [210,210,150,150,"var(--sun-500)"],
        ].map(([x,y,w,h,c],i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="16" fill={c} opacity=".88"/>
        ))}
      </g>
    ),
  };

  return (
    <svg className="print-art" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="400" fill={p.bg}/>
      {layout[variant] || layout["yarn"]}
      {/* subtle paper grain */}
      <rect width="400" height="400" fill="url(#grain)"/>
      <defs>
        <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent"/>
          <circle cx="0.5" cy="0.5" r="0.5" fill={p.ink} opacity="0.025"/>
        </pattern>
      </defs>
    </svg>
  );
}

// Product artwork: render the real photo when present, else fall back to the
// crochet-flavoured PrintArt placeholder (also covers photos not added yet).
function ProductArt({ p }) {
  const [err, setErr] = React.useState(false);
  if (p && p.img && !err) {
    return (
      <img
        className="print-art"
        src={p.img}
        alt={p.title || ""}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        onError={() => setErr(true)}
      />
    );
  }
  return <PrintArt variant={p ? p.artVariant : "yarn"} />;
}

Object.assign(window, { CONFIG, CATEGORIES, PRODUCTS, PrintArt, ProductArt });
