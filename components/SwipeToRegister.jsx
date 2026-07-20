"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import TicketLoader from "./TicketLoader";
import AuthForm from "./AuthForm";
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser";

const THUMB = 52;
const TRACK_PAD = 4;
const CONFIRM_THRESHOLD = 0.82;
const PHONE_RE = /^[6-9]\d{9}$/;

export default function SwipeToRegister({
  href,
  tournamentId,
  idleLabel = "Slide to Register",
  busyLabel = "Calling…",
  initialSignedIn = false,
  initialName = "",
  initialPhone = "",
}) {
  const pathname = usePathname();
  const trackRef = useRef(null);
  const maxXRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const [step, setStep] = useState("idle"); // idle | signin | confirm | success
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [wantsUpdates, setWantsUpdates] = useState(true);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getMaxX = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.offsetWidth - THUMB - TRACK_PAD * 2);
  }, []);

  const openAt = useCallback(
    (nextStep) => {
      maxXRef.current = maxXRef.current || getMaxX();
      setDragX(maxXRef.current);
      setStep(nextStep);
    },
    [getMaxX]
  );

  function openConfirm() {
    openAt(signedIn ? "confirm" : "signin");
  }

  function resetSlider() {
    setStep("idle");
    setDragX(0);
    setName(initialName);
    setPhone(initialPhone);
    setWantsUpdates(true);
    setFormError("");
  }

  function call() {
    setLocked(true);
    window.setTimeout(() => {
      window.location.href = href;
    }, 300);
  }

  // While the inline sign-in step is open, listen for it completing
  // (email/password sign-in happens without a page reload) and advance.
  useEffect(() => {
    if (step !== "signin") return undefined;
    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (event !== "SIGNED_IN" || !authSession?.user) return;
      setSignedIn(true);
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", authSession.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) setName((n) => n || data.full_name);
          if (data?.phone) setPhone((p) => p || data.phone);
        });
      setStep("confirm");
    });
    return () => subscription.unsubscribe();
  }, [step]);

  // Resumes after a Google OAuth round trip: /auth/callback redirects back
  // here with ?register=1 so the player doesn't have to swipe again.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("register") !== "1") return;
    url.searchParams.delete("register");
    window.history.replaceState({}, "", url.toString());
    if (initialSignedIn) {
      openAt("confirm");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

    if (!trimmedName) {
      setFormError("Please enter your name.");
      return;
    }
    if (!PHONE_RE.test(digits)) {
      setFormError("Please enter a valid 10-digit phone number.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/registrations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId,
          name: trimmedName,
          phone: digits,
          wantsUpdates,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitting(false);
        setFormError(data.error || "Couldn't save your registration. Please try again.");
        return;
      }
    } catch {
      setSubmitting(false);
      setFormError("Couldn't save your registration. Please try again.");
      return;
    }

    setSubmitting(false);
    setStep("success");
    window.setTimeout(() => {
      setStep("idle");
      call();
    }, 1200);
  }

  function handlePointerDown(e) {
    if (locked || step !== "idle") return;
    maxXRef.current = getMaxX();
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - TRACK_PAD - THUMB / 2;
    setDragX(Math.max(0, Math.min(maxXRef.current, x)));
  }

  function finishDrag() {
    if (!dragging) return;
    setDragging(false);
    const max = maxXRef.current || 1;
    if (dragX / max >= CONFIRM_THRESHOLD) {
      openConfirm();
    } else {
      setDragX(0);
    }
  }

  function handleKeyDown(e) {
    if (locked || step !== "idle") return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    maxXRef.current = getMaxX();
    openConfirm();
  }

  const active = locked;
  const showingCard = step !== "idle";
  const shownX = active || showingCard ? maxXRef.current || getMaxX() : dragX;
  const max = getMaxX() || 1;
  const progress = Math.min(1, shownX / max);

  return (
    <>
      <div
        className="swipe-register-track"
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div
          className="swipe-register-fill"
          style={{
            width: `${shownX + THUMB}px`,
            transition: dragging ? "none" : "width 0.25s ease",
          }}
        />
        <span
          className="swipe-register-label"
          style={{ opacity: Math.max(0, 1 - progress * 1.6) }}
        >
          {active ? busyLabel : idleLabel}
        </span>
        <div
          className={`swipe-register-thumb${dragging ? " is-dragging" : ""}${
            active ? " is-active" : ""
          }`}
          style={{
            transform: `translateX(${shownX}px)`,
            transition: dragging ? "none" : "transform 0.25s ease",
          }}
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-disabled={locked}
          aria-label={`${idleLabel} — sign in and enter your details to call the organizer`}
          onPointerDown={handlePointerDown}
          onKeyDown={handleKeyDown}
        >
          {active ? (
            <TicketLoader iconOnly size="sm" label={busyLabel} />
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      {showingCard && (
        <div
          className="register-confirm-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Register for this tournament"
        >
          <div
            className="register-confirm-card"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "signin" && (
              <>
                <h3>Sign in to register</h3>
                <p className="register-confirm-sub">
                  Sign in so the organizer knows who&rsquo;s registering — it only takes a moment.
                </p>
                <AuthForm next={`${pathname}?register=1`} />
                <div className="register-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetSlider}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {step === "confirm" && (
              <form onSubmit={handleConfirm}>
                <h3>Confirm your details</h3>
                <p className="register-confirm-sub">
                  We&rsquo;ll save these so the organizer knows who&rsquo;s calling.
                </p>

                <label className="post-field">
                  Your name
                  <input
                    type="text"
                    autoFocus
                    maxLength={80}
                    value={name}
                    disabled={submitting}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="post-field">
                  Phone number
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    disabled={submitting}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </label>

                <label className="register-confirm-checkbox">
                  <input
                    type="checkbox"
                    checked={wantsUpdates}
                    disabled={submitting}
                    onChange={(e) => setWantsUpdates(e.target.checked)}
                  />
                  Receive tournament updates regularly
                </label>

                {formError && <p className="post-error">{formError}</p>}

                <div className="register-confirm-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={submitting}
                    onClick={resetSlider}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting…" : "Confirm & Call"}
                  </button>
                </div>
              </form>
            )}

            {step === "success" && (
              <div className="register-success">
                <div className="register-success-icon" aria-hidden="true">
                  ✓
                </div>
                <h3>You&rsquo;re registered!</h3>
                <p className="register-confirm-sub">
                  Calling the organizer now so you can lock in your spot…
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
