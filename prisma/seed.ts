import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.upsert({
    where: { email: "hello@lav-crochets.art" },
    update: {},
    create: {
      name: "Lav Crochets",
      email: "hello@lav-crochets.art",
      role: "admin",
    },
  });
  console.log("Created admin user:", admin.email);

  const products = [
    { id: "p1", slug: "spiderman-bag-charm", title: "Spiderman Bag Charm", description: "A crocheted Spider-Man head charm in bright red with the classic black web eye-patches and a small navy accent on top. Hangs from a white cord loop, ready to clip onto a tote or backpack.", category: "charms", chip: "new", priceINR: 400, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify(["/catalogue-images/spiderman-bag-charm.webp"]), materials: "Cotton yarn, cord loop", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Red, black & white eyes, navy accent"]), care: "Spot clean only. Keep away from damp." },
    { id: "p2", slug: "spiderman-gwen-couple-charm", title: "Spiderman & Gwen Couple Charm", description: "A matching pair sold together: the red Spider-Man head and a pink Spider-Gwen head with white eye-patches outlined in pink. Each hangs from its own white cord, perfect as a couple or duo charm.", category: "charms", chip: "pick", priceINR: 700, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify(["/catalogue-images/spiderman-gwen-couple-charm.webp"]), materials: "Cotton yarn, cord loops", sizeOptions: JSON.stringify(["Set of two"]), colorOptions: JSON.stringify(["Red Spider-Man + pink Gwen"]), care: "Spot clean only. Keep away from damp." },
    { id: "p3", slug: "plumeria-flower-clip", title: "Plumeria Flower Clip", description: "A single crocheted plumeria (frangipani) flower hair clip, white petals with a soft pink blush at the centre. Light and easy to clip into hair.", category: "hair", chip: null, priceINR: 120, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify(["/catalogue-images/plumeria-flower-clip.webp"]), materials: "Cotton yarn, hair clip", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["White with pink centre"]), care: "Spot clean only. Reshape petals by hand." },
    { id: "p4", slug: "tulip-headband", title: "Tulip Headband", description: "A cream headband with a row of raised 3D pink tulips and green leaves along the band. Finished with tie ends and a bow, plus a small tulip motif on each tie.", category: "hair", chip: "new", priceINR: 300, stockStatus: "made-to-order", turnaroundDays: 5, images: JSON.stringify(["/catalogue-images/tulip-headband.webp"]), materials: "Cotton yarn", sizeOptions: JSON.stringify(["One size (ties to fit)"]), colorOptions: JSON.stringify(["Cream band, pink tulips, green leaves", "Custom on request"]), care: "Hand wash cold, reshape, dry flat." },
    { id: "p5", slug: "daisy-headband", title: "Daisy Headband", description: "A headband of joined white daisies with yellow centres, worn across the head like a flower crown.", category: "hair", chip: null, priceINR: 280, stockStatus: "made-to-order", turnaroundDays: 3, images: JSON.stringify(["/catalogue-images/daisy-headband.webp"]), materials: "Cotton yarn", sizeOptions: JSON.stringify(["One size (stretch fit)"]), colorOptions: JSON.stringify(["White petals, yellow centres", "Custom on request"]), care: "Hand wash cold, reshape, dry flat." },
    { id: "p6", slug: "strawberry-keychain", title: "Strawberry Keychain", description: "A plump pink crocheted strawberry topped with a green leaf and a white five-petal flower, attached to a silver lobster clasp.", category: "keychains", chip: "new", priceINR: 180, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify(["/catalogue-images/strawberry-keychain.webp"]), materials: "Cotton yarn, lobster clasp", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Pink strawberry, green leaf, white flower"]), care: "Spot clean only." },
    { id: "p7", slug: "miles-morales-spider-verse-charm", title: "Miles Morales Spider-Verse Charm", description: "A Spider-Verse style Miles Morales head charm in black with red web stitching and white eye-patches. Hangs from a cord loop for bags and backpacks.", category: "charms", chip: "new", priceINR: 450, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, cord loop", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Black with red web lines"]), care: "Spot clean only. Keep away from damp.", sortOrder: 10 },
    { id: "p8", slug: "mini-heart-bag-charm", title: "Mini Heart Bag Charm", description: "A puffy little crocheted heart on a key ring. Small enough for a zip pull, cute enough for a gift.", category: "charms", chip: null, priceINR: 150, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, key ring", sizeOptions: JSON.stringify(["Palm size"]), colorOptions: JSON.stringify(["Lavender", "Pink", "Red"]), care: "Spot clean only.", sortOrder: 11 },
    { id: "p9", slug: "sunflower-bag-charm", title: "Sunflower Bag Charm", description: "A bright sunflower with layered petals and a textured centre, on a lobster clasp so it clips onto any bag.", category: "charms", chip: null, priceINR: 220, stockStatus: "made-to-order", turnaroundDays: 4, images: JSON.stringify([]), materials: "Cotton yarn, lobster clasp", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Yellow petals, brown centre"]), care: "Spot clean only. Reshape petals by hand.", sortOrder: 12 },
    { id: "p10", slug: "bow-scrunchie", title: "Bow Scrunchie", description: "A soft crocheted scrunchie with a little bow on top. Gentle on hair and easy to wear all day.", category: "hair", chip: "new", priceINR: 180, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, soft elastic", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Lavender", "Cream", "Baby pink"]), care: "Hand wash cold, dry flat.", sortOrder: 13 },
    { id: "p11", slug: "mini-daisy-hair-clips", title: "Mini Daisy Hair Clips (set of 2)", description: "Two tiny daisy clips to tuck into braids or pin back fringe. Sold as a pair.", category: "hair", chip: null, priceINR: 160, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, metal clips", sizeOptions: JSON.stringify(["Set of two"]), colorOptions: JSON.stringify(["White petals, yellow centres"]), care: "Spot clean only.", sortOrder: 14 },
    { id: "p12", slug: "ribbed-knit-headband", title: "Ribbed Crochet Headband", description: "A simple ribbed headband with a twisted front. Comfortable, stretchy, and made in your colour.", category: "hair", chip: null, priceINR: 260, stockStatus: "made-to-order", turnaroundDays: 4, images: JSON.stringify([]), materials: "Cotton yarn", sizeOptions: JSON.stringify(["Adult", "Kids"]), colorOptions: JSON.stringify(["Lavender", "Sage", "Cream", "Custom on request"]), care: "Hand wash cold, reshape, dry flat.", sortOrder: 15 },
    { id: "p13", slug: "cherry-keychain", title: "Cherry Keychain", description: "A pair of round crochet cherries joined at the stem, on a silver key ring.", category: "keychains", chip: "new", priceINR: 170, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, key ring", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Red cherries, green stem"]), care: "Spot clean only.", sortOrder: 16 },
    { id: "p14", slug: "lavender-sprig-keychain", title: "Lavender Sprig Keychain", description: "A small sprig of crocheted lavender buds tied with a tiny bow. A soft nod to the studio's name.", category: "keychains", chip: null, priceINR: 190, stockStatus: "made-to-order", turnaroundDays: 3, images: JSON.stringify([]), materials: "Cotton yarn, key ring", sizeOptions: JSON.stringify(["One size"]), colorOptions: JSON.stringify(["Lavender buds, green stem"]), care: "Spot clean only.", sortOrder: 17 },
    { id: "p15", slug: "earphone-case-pouch", title: "Earphone Case Pouch", description: "A little zip pouch that keeps wired earphones or a small earbud case together. Clips onto your bag with a key ring.", category: "cases", chip: "new", priceINR: 280, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, zip, key ring", sizeOptions: JSON.stringify(["Fits most earphone cases"]), colorOptions: JSON.stringify(["Lavender", "Pink", "Cream"]), care: "Hand wash cold, dry flat.", sortOrder: 18 },
    { id: "p16", slug: "airpods-case-cover", title: "AirPods Case Cover", description: "A snug crocheted cover for your AirPods case with a clasp to hook onto a bag. Tell me your model at checkout notes.", category: "cases", chip: null, priceINR: 320, stockStatus: "made-to-order", turnaroundDays: 5, images: JSON.stringify([]), materials: "Cotton yarn, lobster clasp", sizeOptions: JSON.stringify(["AirPods 1/2", "AirPods 3", "AirPods Pro"]), colorOptions: JSON.stringify(["Lavender", "Pink", "Sage", "Custom on request"]), care: "Hand wash cold, dry flat.", sortOrder: 19 },
    { id: "p17", slug: "lip-balm-holder-keychain", title: "Lip Balm Holder Keychain", description: "A tiny crocheted sleeve that holds your lip balm and hangs from your keys, so it's always on hand.", category: "cases", chip: null, priceINR: 160, stockStatus: "ready", turnaroundDays: 0, images: JSON.stringify([]), materials: "Cotton yarn, key ring", sizeOptions: JSON.stringify(["Fits a standard lip balm"]), colorOptions: JSON.stringify(["Lavender", "Pink", "Peach"]), care: "Spot clean only.", sortOrder: 20 },
  ];

  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, update: product, create: product });
  }
  console.log("Created", products.length, "products");

  await prisma.coupon.upsert({
    where: { code: "LAV10" },
    update: {},
    create: { code: "LAV10", type: "percent", value: 10, minOrderINR: 200, usageLimit: null, perUserLimit: 1, active: true },
  });
  console.log("Created coupon: LAV10 (10% off)");

  console.log("Seeding complete!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
