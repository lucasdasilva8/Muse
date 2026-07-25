"use client";

import { useEffect, useState } from "react";
import {
  apiEscrowAction,
  apiListEscrowEvents,
} from "@/lib/api";
import { money } from "@/lib/format";
import { POLICY } from "@/lib/pricing";
import type { EscrowEvent, Listing } from "@/lib/types";

function statusLabel(status: Listing["escrowStatus"]) {
  switch (status) {
    case "collecting":
      return "Collecting in escrow";
    case "holding":
      return "Holding — raise closed";
    case "released":
      return "Released to artist";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

export function EscrowPanel({
  listing,
  canAct = false,
  onUpdated,
}: {
  listing: Listing;
  /** Artist/admin can close raise / release */
  canAct?: boolean;
  onUpdated?: () => void | Promise<void>;
}) {
  const [events, setEvents] = useState<EscrowEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [localListing, setLocalListing] = useState(listing);

  useEffect(() => {
    setLocalListing(listing);
  }, [listing]);

  useEffect(() => {
    void apiListEscrowEvents(listing.id)
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]));
  }, [listing.id, localListing.escrowStatus, localListing.escrowBalance]);

  const feePreview =
    Math.round(localListing.escrowBalance * POLICY.raiseFeeRate * 100) / 100;
  const netPreview =
    Math.round((localListing.escrowBalance - feePreview) * 100) / 100;

  async function run(action: "close_raise" | "release_to_artist") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiEscrowAction(listing.id, action);
      if (result.listing) setLocalListing(result.listing);
      setEvents(result.events);
      setNotice(result.notice || "Escrow updated.");
      await onUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Escrow action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: "1.25rem" }}>
      <h2>Escrow (simulated fiat)</h2>
      <p className="muted">
        Fan commitments sit in platform escrow — not Muse operating cash —
        until release rules fire. Prototype only; no bank or crypto rails.
      </p>

      <div className="grid-3" style={{ margin: "1rem 0" }}>
        <div className="stat">
          <div className="label">Status</div>
          <div className="value" style={{ fontSize: "1.05rem" }}>
            {statusLabel(localListing.escrowStatus)}
          </div>
        </div>
        <div className="stat">
          <div className="label">In escrow</div>
          <div className="value">{money(localListing.escrowBalance)}</div>
        </div>
        <div className="stat">
          <div className="label">Released to artist</div>
          <div className="value">
            {money(localListing.artistReleasedAmount)}
          </div>
        </div>
      </div>

      {localListing.platformFeeCollected > 0 && (
        <p className="muted">
          Platform fee collected (sim):{" "}
          {money(localListing.platformFeeCollected)}
        </p>
      )}

      {canAct && localListing.escrowStatus !== "released" && (
        <div className="btn-row" style={{ marginTop: "0.75rem" }}>
          {localListing.escrowStatus === "collecting" &&
            localListing.escrowBalance > 0 && (
              <button
                className="btn btn-outline"
                type="button"
                disabled={busy}
                onClick={() => void run("close_raise")}
              >
                Close raise (hold)
              </button>
            )}
          {localListing.escrowBalance > 0 && (
            <button
              className="btn"
              type="button"
              disabled={busy}
              onClick={() => void run("release_to_artist")}
            >
              {busy
                ? "Working…"
                : `Release to artist · net ${money(netPreview)}`}
            </button>
          )}
        </div>
      )}

      {localListing.escrowBalance > 0 && canAct && (
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Fee at release: {(POLICY.raiseFeeRate * 100).toFixed(0)}% ≈{" "}
          {money(feePreview)}
        </p>
      )}

      {error && <p className="error">{error}</p>}
      {notice && <p className="callout callout-ok">{notice}</p>}

      {events.length > 0 && (
        <>
          <h3 style={{ marginTop: "1rem", fontSize: "1rem" }}>Ledger</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 12).map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="badge badge-mid">{e.type}</span>
                  </td>
                  <td>{money(e.amount)}</td>
                  <td className="muted">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
