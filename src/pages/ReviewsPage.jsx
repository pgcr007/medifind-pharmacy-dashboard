import { useState, useEffect, useCallback, useMemo } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as api from "../api/endpoints";
import { PageShell } from "./PharmacyProfilePage";
import Pagination from "../components/Pagination";
import { ErrorState } from "../components/StateViews";

const PAGE_SIZE = 8;

export default function ReviewsPage() {
  const { pharmacy, pharmacyLoading } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!pharmacy) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getPharmacyReviews(pharmacy._id);
      setReviews(data);
    } catch {
      setError("Couldn't load reviews.");
    } finally {
      setLoading(false);
    }
  }, [pharmacy]);

  useEffect(() => {
    load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [reviews, page]
  );

  function handleReplied(reviewId, updatedReview) {
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? updatedReview : r))
    );
  }

  if (pharmacyLoading || !pharmacy) {
    return (
      <PageShell title="Reviews">
        <p className="text-ink-soft text-sm">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell title="Reviews">
      {pharmacy.reviewCount > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Star size={18} className="fill-amber text-amber" />
          <span className="font-display text-xl text-ink">
            {pharmacy.averageRating}
          </span>
          <span className="text-sm text-ink-soft">
            average from {pharmacy.reviewCount}{" "}
            {pharmacy.reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}

      {loading ? (
        <p className="text-ink-soft text-sm">Loading reviews…</p>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : reviews.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <p className="text-ink font-medium mb-1">No reviews yet</p>
          <p className="text-ink-soft text-sm">
            Reviews from patients who've used your pharmacy will show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pageItems.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                onReplied={(updated) => handleReplied(review._id, updated)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            total={reviews.length}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </PageShell>
  );
}

function ReviewCard({ review, onReplied }) {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmitReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const updated = await api.replyToReview(review._id, replyText.trim());
      onReplied(updated);
      setReplyText("");
    } catch {
      setError("Couldn't send reply. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ledger-card p-5">
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-medium text-ink">{review.userId?.name || "Anonymous"}</div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={14}
              className={
                i <= review.rating
                  ? "fill-amber text-amber"
                  : "text-hairline"
              }
            />
          ))}
        </div>
      </div>

      {review.createdAt && (
        <div className="text-xs text-ink-soft mb-2">
          {new Date(review.createdAt).toLocaleDateString()}
        </div>
      )}

      {review.comment && (
        <p className="text-sm text-ink mb-3">{review.comment}</p>
      )}

      {review.ownerReply?.text ? (
        <div className="rounded bg-paper-dim/60 border border-hairline px-3.5 py-2.5 mt-2">
          <div className="text-xs font-medium uppercase tracking-wide text-bottle mb-1">
            Your reply
          </div>
          <p className="text-sm text-ink">{review.ownerReply.text}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitReply} className="mt-3 flex gap-2">
          <input
            className="input py-2 text-sm flex-1"
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !replyText.trim()}
            className="rounded bg-bottle text-paper text-sm font-medium px-4 py-2 hover:bg-bottle-dark disabled:opacity-60 transition-colors shrink-0"
          >
            {submitting ? "Sending…" : "Reply"}
          </button>
        </form>
      )}
      {error && <p className="text-xs text-rust mt-1.5">{error}</p>}
    </div>
  );
}