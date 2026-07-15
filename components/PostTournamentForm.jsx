"use client";

import { useRef, useState } from "react";
import {
  SPORT_OPTIONS,
  TOURNAMENT_FORMATS,
  TOURNAMENT_TYPE_TAGS,
  GENDER_TAGS,
  REGISTRATION_STATUSES,
  getCitySuggestions,
} from "@/lib/tournaments";
import PosterUploadField from "@/components/PosterUploadField";
import SlideToSubmit from "@/components/SlideToSubmit";
import PromotionPackages from "@/components/PromotionPackages";
import Modal from "@/components/Modal";

const TELEGRAM_HANDLE = "6374753084";

function buildInitialForm(initialProfile) {
  return {
    ...initialForm,
    organizer_name: initialProfile?.name || "",
    organizer_phone: initialProfile?.phone || "",
    organizer_email: initialProfile?.email || "",
  };
}

const initialForm = {
  name: "",
  sport: "",
  sportOther: "",
  organizer_name: "",
  organizer_phone: "",
  instagram_id: "",
  city: "",
  venue: "",
  address: "",
  pincode: "",
  start_date: "",
  format: "",
  formatOther: "",
  image_url: "",
  entry_fee_amount: "",
  prize_pool: "",
  promotions: [],

  // Only collected/sent when a promotion package that needs a design brief
  // (Poster Design, Reel Creation) is selected — see needsBrief below.
  // Everything already asked above (name, sport, venue, dates, format, entry
  // fee, winner prize, poster) is deliberately not repeated here.
  brief_mode: "structured", // "structured" | "freeform"
  brief_text: "",
  banner_url: "",
  description: "",
  whatsapp_number: "",
  organizer_email: "",
  organizer_website: "",
  google_maps_link: "",
  end_date: "",
  registration_last_date: "",
  reporting_time: "",
  start_time: "",
  team_size: "",
  max_teams: "",
  ball_type: "",
  second_prize: "",
  third_prize: "",
  other_awards: "",
  registration_link: "",
  registration_qr_url: "",
  registration_status: "",
  tournament_type_tag: "",
  gender_tag: "",

  website: "", // honeypot — real users never fill this in
};

export default function PostTournamentForm({ initialProfile } = {}) {
  const formRef = useRef(null);
  const [form, setForm] = useState(() => buildInitialForm(initialProfile));
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");
  const [resetTick, setResetTick] = useState(0);
  const [showTelegramNotice, setShowTelegramNotice] = useState(false);
  const [hasTelegramPromo, setHasTelegramPromo] = useState(false);
  const [submittedWithTelegramPromo, setSubmittedWithTelegramPromo] = useState(false);
  const [needsBrief, setNeedsBrief] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function fail(message) {
    setError(message);
    setStatus("error");
    setResetTick((t) => t + 1);
  }

  async function submitTournament() {
    setError("");

    if (!form.image_url) {
      fail("Please upload the main tournament poster.");
      return;
    }

    setStatus("submitting");

    const sport = form.sport === "Other" ? form.sportOther.trim() : form.sport;
    const format = form.format === "Other" ? form.formatOther.trim() : form.format;

    // The brief fields only mean anything when a design-brief package
    // (Poster Design / Reel Creation) is selected — leave them out
    // otherwise instead of sending a pile of empty strings.
    const { brief_mode, brief_text, ...rest } = form;
    const briefFields = needsBrief
      ? brief_mode === "freeform"
        ? { promo_brief_mode: "freeform", promo_brief_text: brief_text }
        : { promo_brief_mode: "structured" }
      : {};

    try {
      const res = await fetch("/api/tournaments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, ...briefFields, sport, format }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        fail(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmittedWithTelegramPromo(hasTelegramPromo);
      setStatus("success");
      setForm(buildInitialForm(initialProfile));
    } catch {
      fail("Network error. Please try again.");
    }
  }

  function attemptSubmit() {
    const form = formRef.current;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      setResetTick((t) => t + 1);
      return;
    }
    submitTournament();
  }

  function handleSubmit(e) {
    e.preventDefault();
    attemptSubmit();
  }

  if (status === "success") {
    return (
      <div className="post-success">
        <h3>Request Submitted Successfully!</h3>
        <p>
          It&rsquo;s now pending review. Once our team approves it (usually
          within 24–48 hrs), it&rsquo;ll go live and show up in search across
          the site.
        </p>
        {submittedWithTelegramPromo && (
          <div className="post-success-telegram">
            <p>
              Since you selected Instagram Reel or Reel Creation, please send
              your reel/media files along with your payment screenshot to:
            </p>
            <p>
              <strong>Telegram: {TELEGRAM_HANDLE}</strong>
            </p>
            <p>
              Your tournament will be reviewed and published once
              verification is complete.
            </p>
          </div>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setStatus("idle")}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form className="post-form" onSubmit={handleSubmit} ref={formRef}>
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => update("website", e.target.value)}
        className="post-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="post-form-grid">
        <h3 className="post-form-section">1. Basic information</h3>

        <label className="post-field post-field-wide">
          Tournament name
          <input
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Sport
          <select
            required
            value={form.sport}
            onChange={(e) => update("sport", e.target.value)}
          >
            <option value="" disabled>
              Pick a sport
            </option>
            {SPORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        {form.sport === "Other" && (
          <label className="post-field">
            Name your sport
            <input
              type="text"
              required
              maxLength={60}
              value={form.sportOther}
              onChange={(e) => update("sportOther", e.target.value)}
            />
          </label>
        )}

        <h3 className="post-form-section">2. Organizer</h3>

        <label className="post-field">
          Organizer name
          <input
            type="text"
            required
            maxLength={80}
            value={form.organizer_name}
            onChange={(e) => update("organizer_name", e.target.value)}
          />
        </label>

        <label className="post-field">
          Contact number
          <input
            type="tel"
            required
            value={form.organizer_phone}
            onChange={(e) => update("organizer_phone", e.target.value)}
          />
        </label>

        <label className="post-field">
          Instagram ID
          <div className="post-input-prefix">
            <input
              type="text"
              required
              maxLength={60}
              placeholder="yourhandle"
              value={form.instagram_id}
              onChange={(e) =>
                update("instagram_id", e.target.value.replace(/^@+/, ""))
              }
            />
          </div>
        </label>

        <h3 className="post-form-section">3. Venue</h3>

        <label className="post-field">
          City
          <input
            type="text"
            required
            maxLength={60}
            list="city-suggestions"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <datalist id="city-suggestions">
            {getCitySuggestions().map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <label className="post-field post-field-wide">
          Venue name
          <input
            type="text"
            required
            maxLength={160}
            value={form.venue}
            onChange={(e) => update("venue", e.target.value)}
          />
        </label>

        <label className="post-field post-field-wide">
          Address
          <input
            type="text"
            required
            maxLength={300}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </label>

        <label className="post-field">
          Venue pincode
          <input
            type="text"
            required
            inputMode="numeric"
            pattern="\d{6}"
            title="6-digit pincode"
            maxLength={6}
            placeholder="e.g. 560001"
            value={form.pincode}
            onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))}
          />
        </label>

        <h3 className="post-form-section">4. Schedule</h3>

        <label className="post-field">
          Tournament date
          <input
            type="date"
            required
            value={form.start_date}
            onChange={(e) => update("start_date", e.target.value)}
          />
        </label>

        <h3 className="post-form-section">5. Tournament details</h3>

        <label className="post-field">
          Tournament format
          <select
            required
            value={form.format}
            onChange={(e) => update("format", e.target.value)}
          >
            <option value="" disabled>
              Pick a format
            </option>
            {TOURNAMENT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        {form.format === "Other" && (
          <label className="post-field">
            Describe the format
            <input
              type="text"
              required
              maxLength={160}
              value={form.formatOther}
              onChange={(e) => update("formatOther", e.target.value)}
            />
          </label>
        )}

        <label className="post-field">
          Entry fee (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.entry_fee_amount}
            onChange={(e) => update("entry_fee_amount", e.target.value)}
          />
        </label>

        <h3 className="post-form-section">6. Prize pool</h3>

        <label className="post-field">
          Winner prize (₹)
          <input
            type="number"
            required
            min="0"
            step="1"
            value={form.prize_pool}
            onChange={(e) => update("prize_pool", e.target.value)}
          />
        </label>

        <h3 className="post-form-section">7. Upload poster ⭐</h3>

        <div className="post-field post-field-wide">
          Main tournament poster <span>(required)</span>
          <PosterUploadField
            value={form.image_url}
            onChange={(url) => update("image_url", url)}
          />
        </div>

        <h3 className="post-form-section">8. Promotion services</h3>

        <PromotionPackages
          selections={form.promotions}
          onChange={(promotions) => update("promotions", promotions)}
          onTelegramPackageSelected={() => setShowTelegramNotice(true)}
          onTelegramStateChange={setHasTelegramPromo}
          onBriefStateChange={setNeedsBrief}
        />

        {needsBrief && (
          <>
            <h3 className="post-form-section">9. Poster / reel details</h3>

            <div className="post-field-wide post-brief-intro">
              <p>
                Our team needs a few more details to design your poster/reel.
                Everything you already filled in above (name, sport, venue,
                dates, format, entry fee, winner prize, poster) won&rsquo;t
                be asked again.
              </p>
              <div className="post-brief-toggle" role="radiogroup" aria-label="How would you like to share these details?">
                <label className={form.brief_mode === "structured" ? "is-active" : ""}>
                  <input
                    type="radio"
                    name="brief_mode"
                    value="structured"
                    checked={form.brief_mode === "structured"}
                    onChange={() => update("brief_mode", "structured")}
                  />
                  Fill in the fields
                </label>
                <label className={form.brief_mode === "freeform" ? "is-active" : ""}>
                  <input
                    type="radio"
                    name="brief_mode"
                    value="freeform"
                    checked={form.brief_mode === "freeform"}
                    onChange={() => update("brief_mode", "freeform")}
                  />
                  Paste it all as one paragraph
                </label>
              </div>
            </div>

            {form.brief_mode === "freeform" ? (
              <label className="post-field post-field-wide">
                Tell us everything in one go
                <textarea
                  required
                  maxLength={4000}
                  rows={8}
                  placeholder="e.g. Registration closes 20th July, reporting time 8am, match starts 9am, team size 6-a-side, max 16 teams, ball type: tennis ball, runner-up prize ₹5,000, third prize ₹2,000, other awards: best batter trophy, registration link/QR, WhatsApp +91…, email, website, Google Maps link, short description, tournament type: corporate, gender: men…"
                  value={form.brief_text}
                  onChange={(e) => update("brief_text", e.target.value)}
                />
              </label>
            ) : (
              <>
                <label className="post-field post-field-wide">
                  Short description
                  <textarea
                    maxLength={500}
                    rows={3}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </label>

                <div className="post-field post-field-wide">
                  Tournament banner <span>(optional, if different from poster)</span>
                  <PosterUploadField
                    value={form.banner_url}
                    onChange={(url) => update("banner_url", url)}
                    hint="Click to upload a banner — JPEG, PNG or WEBP, up to 8MB"
                    alt="Tournament banner preview"
                  />
                </div>

                <label className="post-field">
                  WhatsApp number
                  <input
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={(e) => update("whatsapp_number", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Email
                  <input
                    type="email"
                    value={form.organizer_email}
                    onChange={(e) => update("organizer_email", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Website
                  <input
                    type="url"
                    placeholder="https://…"
                    value={form.organizer_website}
                    onChange={(e) => update("organizer_website", e.target.value)}
                  />
                </label>

                <label className="post-field post-field-wide">
                  Google Maps link
                  <input
                    type="url"
                    placeholder="https://maps.google.com/…"
                    value={form.google_maps_link}
                    onChange={(e) => update("google_maps_link", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Tournament end date
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => update("end_date", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Registration last date
                  <input
                    type="date"
                    required
                    value={form.registration_last_date}
                    onChange={(e) => update("registration_last_date", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Reporting time
                  <input
                    type="time"
                    value={form.reporting_time}
                    onChange={(e) => update("reporting_time", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Match start time
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => update("start_time", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Team size
                  <input
                    type="text"
                    required
                    maxLength={40}
                    placeholder="e.g. 6-a-side"
                    value={form.team_size}
                    onChange={(e) => update("team_size", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Maximum teams
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.max_teams}
                    onChange={(e) => update("max_teams", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Ball type / match type <span>(optional)</span>
                  <input
                    type="text"
                    maxLength={60}
                    value={form.ball_type}
                    onChange={(e) => update("ball_type", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Runner-up prize (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.second_prize}
                    onChange={(e) => update("second_prize", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Third prize (₹)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.third_prize}
                    onChange={(e) => update("third_prize", e.target.value)}
                  />
                </label>

                <label className="post-field post-field-wide">
                  Other awards <span>(optional)</span>
                  <input
                    type="text"
                    maxLength={200}
                    value={form.other_awards}
                    onChange={(e) => update("other_awards", e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Registration link
                  <input
                    type="url"
                    placeholder="https://…"
                    value={form.registration_link}
                    onChange={(e) => update("registration_link", e.target.value)}
                  />
                </label>

                <div className="post-field">
                  Registration QR code
                  <PosterUploadField
                    value={form.registration_qr_url}
                    onChange={(url) => update("registration_qr_url", url)}
                    hint="Click to upload a QR code image"
                    alt="Registration QR code preview"
                  />
                </div>

                <label className="post-field">
                  Registration status
                  <select
                    value={form.registration_status}
                    onChange={(e) => update("registration_status", e.target.value)}
                  >
                    <option value="">Not set</option>
                    {REGISTRATION_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="post-field">
                  Tournament type
                  <select
                    value={form.tournament_type_tag}
                    onChange={(e) => update("tournament_type_tag", e.target.value)}
                  >
                    <option value="">Not set</option>
                    {TOURNAMENT_TYPE_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="post-field">
                  Gender
                  <select
                    value={form.gender_tag}
                    onChange={(e) => update("gender_tag", e.target.value)}
                  >
                    <option value="">Not set</option>
                    {GENDER_TAGS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </>
        )}
      </div>

      <div className="post-submit-bar">
        {error && <p className="post-error">{error}</p>}
        <SlideToSubmit
          onConfirm={attemptSubmit}
          busy={status === "submitting"}
          resetSignal={resetTick}
          idleLabel="Slide to submit for review"
          busyLabel="Submitting…"
        />
      </div>

      <Modal
        open={showTelegramNotice}
        onClose={() => setShowTelegramNotice(false)}
        title="⚠️ Important"
      >
        <p>
          Please send your reel (or tournament photos/videos for reel
          creation) along with your payment screenshot to our Telegram.
        </p>
        <p>
          <strong>Telegram: {TELEGRAM_HANDLE}</strong>
        </p>
        <p>Your promotion will begin only after both are received.</p>
      </Modal>
    </form>
  );
}
