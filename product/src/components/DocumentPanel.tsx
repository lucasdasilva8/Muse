"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  apiListDocuments,
  apiUploadDocument,
  apiVerifyDocument,
} from "@/lib/api";
import type { ArtistDocument, DocumentCategory } from "@/lib/types";

export function DocumentPanel({
  listingId,
  canUpload = false,
  canVerify = false,
}: {
  listingId: string;
  canUpload?: boolean;
  canVerify?: boolean;
}) {
  const [docs, setDocs] = useState<ArtistDocument[]>([]);
  const [category, setCategory] =
    useState<DocumentCategory>("distributor_statement");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await apiListDocuments(listingId);
      setDocs(data.documents);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load docs");
    }
  }, [listingId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiUploadDocument({
        listingId,
        category,
        file,
      });
      setNotice(result.notice || "Uploaded (prototype stub).");
      setFile(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVerified(doc: ArtistDocument) {
    try {
      await apiVerifyDocument(doc.id, !doc.verified);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    }
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h2>Financial documents (stub)</h2>
      <p className="muted">
        Prototype uploads only — not OCR’d or auto-verified. Max 8MB.
      </p>

      {canUpload && (
        <form onSubmit={onUpload} style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DocumentCategory)
              }
            >
              <option value="distributor_statement">Distributor statement</option>
              <option value="tax_return">Tax return</option>
              <option value="bank_export">Bank export</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>File</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Uploading…" : "Upload prototype doc"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {notice && <p className="callout-ok callout">{notice}</p>}

      {docs.length === 0 ? (
        <p className="muted">No documents yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Category</th>
              <th>Verified</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer">
                    {d.filename}
                  </a>
                  <div className="muted">
                    {(d.sizeBytes / 1024).toFixed(1)} KB · {d.backend}
                  </div>
                </td>
                <td>{d.category}</td>
                <td>
                  {d.verified ? (
                    <span className="badge badge-ok">Yes</span>
                  ) : (
                    <span className="badge badge-warn">No</span>
                  )}
                </td>
                <td>
                  {canVerify && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => toggleVerified(d)}
                    >
                      {d.verified ? "Unverify" : "Mark verified"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
