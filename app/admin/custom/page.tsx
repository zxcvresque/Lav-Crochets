import { prisma } from "@/lib/prisma";
import { customPhotoUrl, photoNames } from "@/lib/custom-photos";

export const dynamic = "force-dynamic";

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(d);

// /admin/custom — custom-order requests from /custom, newest first, with
// the customer's reference photos (served admin-only).
export default async function CustomRequestsPage() {
  const requests = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Custom requests</h1>
          <p className="admin-page-sub">
            {requests.length === 0
              ? "No custom requests yet. They appear here as soon as someone sends the form on /custom."
              : `${requests.length} request${requests.length === 1 ? "" : "s"}, newest first. Reply by email to confirm design, making time and price.`}
          </p>
        </div>
      </div>

      <div className="admin-custom-list">
        {requests.map((r) => {
          const photos = photoNames(r.photos);
          return (
            <article key={r.id} className="admin-block admin-custom">
              <header className="admin-custom-head">
                <div>
                  <h2 className="admin-block-title">{r.name}</h2>
                  <p className="admin-custom-meta">
                    <a href={`mailto:${r.email}?subject=${encodeURIComponent("Your custom order with Lav Crochets")}`}>{r.email}</a>
                    {r.phone && <> · {r.phone}</>} · <time dateTime={r.createdAt.toISOString()}>{fmtDate(r.createdAt)}</time>
                  </p>
                </div>
                <span className="admin-status-chip" data-status={r.status === "new" ? "pending" : "shipped"}>
                  {r.status === "new" ? "New" : r.status}
                </span>
              </header>

              <p className="admin-custom-what">{r.whatYouWant}</p>
              <dl className="admin-custom-facts">
                {r.colors && <div><dt>Colours</dt><dd>{r.colors}</dd></div>}
                {r.budget && <div><dt>Budget</dt><dd>{r.budget}</dd></div>}
                {r.notes && <div className="wide"><dt>Notes</dt><dd>{r.notes}</dd></div>}
              </dl>

              {photos.length > 0 && (
                <ul className="admin-custom-photos" aria-label={`Reference photos from ${r.name}`}>
                  {photos.map((n, i) => (
                    <li key={n}>
                      <a href={customPhotoUrl(n)} target="_blank" rel="noopener" aria-label={`Open reference photo ${i + 1} of ${photos.length}`}>
                        {n.endsWith(".heic") ? (
                          <span className="admin-custom-heic">HEIC photo<br />open to view</span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- admin-only, auth-gated route
                          <img src={customPhotoUrl(n)} alt={`Reference photo ${i + 1} from ${r.name}`} loading="lazy" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
