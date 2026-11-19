"use client";
import { useState, useEffect, useRef } from "react";
import { Icon } from "./primitives";
import { SectionHead } from "./section-head";
import { EMAIL_RE, friendlyServerError } from "./form-helpers";

// ── Custom order page (custom.html) ───────────────────────────────────
// Sends the brief to /api/custom/request (emails the studio and the customer).
const CUSTOM_REQUIRED = ["name", "email", "piece"];
function validateCustom(f) {
  const errs = {};
  if (!f.name.trim()) errs.name = "Add your name so I know who to reply to.";
  if (!f.email.trim()) errs.email = "Add your email, that's where I'll reply.";
  else if (!EMAIL_RE.test(f.email.trim())) errs.email = "That email doesn't look right, check for a typo.";
  if (!f.piece.trim()) errs.piece = "Tell me a little about the piece you'd like.";
  return errs;
}

// ── Reference photos (custom order) ───────────────────────────────────
// Up to 5 photos, 5 MB each, JPG/PNG/WebP/HEIC. Each photo uploads as soon as
// it's chosen (with its own progress), so sending the form is instant. The
// server re-checks count, size and the file's real type.
const PHOTO_MAX = 5;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const PHOTO_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;
const fmtMB = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const listNames = (arr) => arr.map((n) => `“${n}”`).join(", ");

function uploadPhoto(file, onProgress) {
  const xhr = new XMLHttpRequest();
  const promise = new Promise((resolve, reject) => {
    xhr.open("POST", "/api/custom/photos");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    xhr.onload = () => {
      const data = xhr.response || {};
      if (xhr.status >= 200 && xhr.status < 300 && data.name) resolve(data.name);
      else reject(new Error(xhr.status === 429 ? "Too many uploads at once, wait a few minutes and try again." : data.error || "That photo didn't upload."));
    };
    xhr.onerror = () => reject(new Error("Upload failed, check your connection."));
    xhr.onabort = () => reject(Object.assign(new Error("aborted"), { aborted: true }));
    const body = new FormData();
    body.append("file", file);
    xhr.send(body);
  });
  return { promise, abort: () => xhr.abort() };
}

function PhotoPicker({ photos, setPhotos, disabled }) {
  const inputRef = useRef(null);
  const xhrs = useRef(new Map());
  const [notice, setNotice] = useState("");
  const [over, setOver] = useState(false);
  const full = photos.length >= PHOTO_MAX;

  useEffect(() => () => {
    // Abort in-flight uploads and free previews when leaving the page.
    xhrs.current.forEach((x) => x.abort());
  }, []);

  const update = (id, patch) => setPhotos((cur) => cur.map((ph) => (ph.id === id ? { ...ph, ...patch } : ph)));

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const wrongType = [], tooBig = [], tooMany = [];
    const accepted = [];
    let room = PHOTO_MAX - photos.length;
    for (const file of files) {
      const okType = PHOTO_TYPES.includes((file.type || "").toLowerCase()) || PHOTO_EXT.test(file.name);
      if (!okType) { wrongType.push(file.name); continue; }
      if (file.size > PHOTO_MAX_BYTES) { tooBig.push(`${file.name} (${fmtMB(file.size)})`); continue; }
      if (room <= 0) { tooMany.push(file.name); continue; }
      room -= 1;
      accepted.push(file);
    }
    const msgs = [];
    if (tooMany.length) msgs.push(`You can add up to ${PHOTO_MAX} photos, so I left out ${listNames(tooMany)}.`);
    if (tooBig.length) msgs.push(`${listNames(tooBig)} ${tooBig.length === 1 ? "is" : "are"} over 5 MB. Try a smaller photo or a screenshot of it.`);
    if (wrongType.length) msgs.push(`${listNames(wrongType)} ${wrongType.length === 1 ? "isn't" : "aren't"} a JPG, PNG, WebP or HEIC photo.`);
    setNotice(msgs.join(" "));

    const items = accepted.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file, label: file.name, size: file.size,
      preview: URL.createObjectURL(file),
      status: "uploading", progress: 0, name: null, error: "",
    }));
    if (!items.length) return;
    setPhotos((cur) => [...cur, ...items]);
    for (const it of items) {
      const job = uploadPhoto(it.file, (pr) => update(it.id, { progress: pr }));
      xhrs.current.set(it.id, job);
      job.promise
        .then((name) => update(it.id, { status: "done", progress: 1, name }))
        .catch((err) => { if (!err.aborted) update(it.id, { status: "error", error: err.message }); })
        .finally(() => xhrs.current.delete(it.id));
    }
  };

  const remove = (ph) => {
    xhrs.current.get(ph.id)?.abort();
    URL.revokeObjectURL(ph.preview);
    setPhotos((cur) => cur.filter((x) => x.id !== ph.id));
    setNotice("");
    // Keep focus in the picker after the thumbnail disappears.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="cfield cphotos">
      <label htmlFor="cf-photos">Reference photos (optional)</label>
      <p id="cf-photos-hint" className="cfield-hint">Up to {PHOTO_MAX} photos · JPG, PNG, WebP or HEIC · 5 MB each. A sketch, a screenshot, your pet: anything that helps.</p>
      <div
        className={`cdrop${over ? " is-over" : ""}${full ? " is-full" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); if (!full) setOver(true); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = full ? "none" : "copy"; }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); }}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          id="cf-photos"
          className="cdrop-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
          aria-describedby={`cf-photos-hint${notice ? " cf-photos-notice" : ""}`}
          disabled={disabled}
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
        <span className="cdrop-ico" aria-hidden="true"><Icon name="upload" size={20} /></span>
        <span className="cdrop-text">
          <strong>{full ? "That's 5 photos, the most I can take" : <><span className="cdrop-tap">Tap to choose photos</span><span className="cdrop-drag">Drop photos here or click to choose</span></>}</strong>
          <span className="cdrop-sub">{photos.length} of {PHOTO_MAX} added</span>
        </span>
      </div>
      <div aria-live="polite">
        {notice && <p id="cf-photos-notice" className="cfield-error cphotos-notice">{notice}</p>}
      </div>
      {photos.length > 0 && (
        <ul className="cthumbs" aria-label="Chosen photos">
          {photos.map((ph) => (
            <li key={ph.id} className={`cthumb is-${ph.status}`}>
              <PhotoThumb ph={ph} />
              {ph.status === "uploading" && (
                <span className="cthumb-progress" role="progressbar" aria-label={`Uploading ${ph.label}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ph.progress * 100)}>
                  <span style={{ transform: `scaleX(${Math.max(0.04, ph.progress)})` }} />
                </span>
              )}
              {ph.status === "done" && <span className="cthumb-ok" aria-hidden="true"><Icon name="check" size={12} stroke={2.6} /></span>}
              {ph.status === "error" && <span className="cthumb-err">{ph.error}</span>}
              <button type="button" className="cthumb-remove" onClick={() => remove(ph)} aria-label={`Remove ${ph.label}`}>
                <Icon name="x" size={14} stroke={2.2} />
              </button>
              <span className="sr-only">{ph.label}, {ph.status === "done" ? "uploaded" : ph.status === "error" ? `failed: ${ph.error}` : "uploading"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// HEIC previews only render in Safari; elsewhere show a labelled tile.
function PhotoThumb({ ph }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return <span className="cthumb-file" aria-hidden="true"><Icon name="image" size={20} /><span>{(ph.label.split(".").pop() || "").toUpperCase()}</span></span>;
  }
  return <img src={ph.preview} alt="" onError={() => setBroken(true)} />;
}

export function CustomPage() {
  const [f, setF] = useState({ name: "", email: "", piece: "", colours: "", size: "", deadline: "", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [errs, setErrs] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF(s => ({ ...s, [k]: v }));
    // Clear a field's error as soon as it's fixed.
    if (errs[k]) setErrs((cur) => {
      const next = validateCustom({ ...f, [k]: v });
      return next[k] ? { ...cur, [k]: next[k] } : (({ [k]: _, ...rest }) => rest)(cur);
    });
  };
  const focusFirstInvalid = (found) => {
    const first = CUSTOM_REQUIRED.find((k) => found[k]);
    if (!first || !formRef.current) return;
    const el = formRef.current.querySelector(`#cf-${first}`);
    if (el) el.focus();
  };
  const submit = async (e) => {
    e.preventDefault();
    const found = validateCustom(f);
    setErrs(found);
    if (Object.keys(found).length) { setError(""); focusFirstInvalid(found); return; }
    if (photos.some((ph) => ph.status === "uploading")) {
      setError("Your photos are still uploading. Give them a moment, then send again.");
      return;
    }
    if (photos.some((ph) => ph.status === "error")) {
      setError("One of your photos didn't upload. Remove it (or add it again), then send.");
      return;
    }
    setStatus("sending");
    setError("");
    const notes = [
      f.size && `Size / quantity: ${f.size}`,
      f.deadline && `Need by: ${f.deadline}`,
      f.notes,
    ].filter(Boolean).join("\n");
    let res;
    try {
      res = await fetch("/api/custom/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name.trim(), email: f.email.trim(), whatYouWant: f.piece, colors: f.colours, notes,
          photos: photos.filter((ph) => ph.status === "done").map((ph) => ph.name),
        }),
      });
    } catch (err) {
      setError("Couldn't send — check your connection and try again. Your details are still here.");
      setStatus("idle");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 400 && /photo/i.test(data.error || "")) {
        setError(data.error);
        setStatus("idle");
        return;
      }
      if (res.status === 400 && /email/i.test(data.error || "")) {
        const fe = { email: "That email doesn't look right, check for a typo." };
        setErrs(fe); focusFirstInvalid(fe);
      }
      setError(friendlyServerError(res.status, data.error));
      setStatus("idle");
      return;
    }
    photos.forEach((ph) => URL.revokeObjectURL(ph.preview));
    setStatus("sent");
  };
  const fieldProps = (k) => ({
    id: `cf-${k}`,
    value: f[k],
    onChange: set(k),
    ...(CUSTOM_REQUIRED.includes(k) ? { "aria-required": true } : {}),
    "aria-invalid": errs[k] ? true : undefined,
    "aria-describedby": errs[k] ? `cf-${k}-err` : undefined,
  });
  const fieldErr = (k) => errs[k]
    ? <p id={`cf-${k}-err`} className="cfield-error">{errs[k]}</p>
    : null;
  return (
    <section className="section page-top" id="custom">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <SectionHead
          level={1}
          title={<>Let's make <em>something yours.</em></>}
        />
        <p className="custom-lead">
          Tell me what you have in mind, a plushie of your pet, a charm of your favourite character,
          a bouquet for a gift. Send the brief and I'll reply by email within 1 to 2 days to confirm
          the design, timing and price together.
        </p>
        {status === "sent" ? (
          <div className="cform cform-sent" role="status">
            <span className="cform-sent-ico" aria-hidden="true"><Icon name="check" size={22} stroke={2.2} /></span>
            <p className="custom-lead"><strong>Thank you, your request is in!</strong> I'll get back to you by email within 1 to 2 days to confirm the design, making time and price.</p>
            <p className="about-sign-name cform-sign">love, Lav</p>
          </div>
        ) : (
        <form className="cform" onSubmit={submit} noValidate ref={formRef}>
          <p className="cform-required-note"><span aria-hidden="true">*</span> Required</p>
          <div className="cgrid">
            <div className="cfield">
              <label htmlFor="cf-name">Your name <span aria-hidden="true">*</span></label>
              <input {...fieldProps("name")} autoComplete="name" placeholder="Your name" />
              {fieldErr("name")}
            </div>
            <div className="cfield">
              <label htmlFor="cf-email">Email <span aria-hidden="true">*</span></label>
              <input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" spellCheck={false} placeholder="you@example.com" />
              {fieldErr("email")}
            </div>
          </div>
          <div className="cfield">
            <label htmlFor="cf-piece">What would you like? <span aria-hidden="true">*</span></label>
            <textarea {...fieldProps("piece")} rows={3} placeholder="e.g. a plushie of my cat, a Spider-Man charm, a tulip bouquet..." />
            {fieldErr("piece")}
          </div>
          <div className="cgrid">
            <div className="cfield">
              <label htmlFor="cf-colours">Colours</label>
              <input {...fieldProps("colours")} placeholder="e.g. pastel pinks" />
            </div>
            <div className="cfield">
              <label htmlFor="cf-size">Size / quantity</label>
              <input {...fieldProps("size")} placeholder="e.g. 2 pieces, palm-size" />
            </div>
          </div>
          <div className="cfield">
            <label htmlFor="cf-deadline">Need it by? (optional)</label>
            <input {...fieldProps("deadline")} placeholder="e.g. before 20 July" />
          </div>
          <div className="cfield">
            <label htmlFor="cf-notes">Anything else? (optional)</label>
            <textarea {...fieldProps("notes")} rows={2} placeholder="Links, references, a story..." />
          </div>
          <PhotoPicker photos={photos} setPhotos={setPhotos} disabled={status === "sending"} />
          <div aria-live="assertive">
            {error && <p className="cform-error">{error}</p>}
          </div>
          <button type="submit" className="btn btn-flash cform-submit center" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send request"} <Icon name="arrow" size={16} />
          </button>
          <p className="custom-note">
            Pay securely with Razorpay (UPI, cards, netbanking) · I confirm the making time and final price by email before you pay.
          </p>
        </form>
        )}
      </div>
    </section>
  );
}
