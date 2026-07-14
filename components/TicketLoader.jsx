/** Site-wide loading indicator: a stable ticket glyph (inspired by the
 * brand mark's ticket-shaped "W") with a typing/erasing label. Drop it
 * anywhere something is loading — a route, a form, a dropzone. */
export default function TicketLoader({
  label = "Loading",
  size = "md", // "sm" | "md" | "lg"
  iconOnly = false,
  page = false,
  inline = false,
  belowNav = false,
  className = "",
}) {
  const classes = [
    "ticket-loader",
    `ticket-loader-${size}`,
    page && "ticket-loader-page",
    page && inline && "ticket-loader-inline",
    page && belowNav && "ticket-loader-below-nav",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="status">
      <svg
        className="ticket-loader-icon"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 12 L26 12 A6 6 0 0 1 38 12 L50 12 A8 8 0 0 1 58 20 L58 25 A7 7 0 0 0 58 39 L58 44 A8 8 0 0 1 50 52 L14 52 A8 8 0 0 1 6 44 L6 39 A7 7 0 0 0 6 25 L6 20 A8 8 0 0 1 14 12 Z"
          fill="var(--crimson)"
          stroke="var(--chalk)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <line
          x1="14"
          y1="32"
          x2="50"
          y2="32"
          stroke="var(--chalk)"
          strokeWidth="2.4"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />
      </svg>
      {!iconOnly && (
        <span className="ticket-loader-text" aria-hidden="true">
          {label}
        </span>
      )}
      <span className="sr-only">{label}…</span>
    </div>
  );
}
