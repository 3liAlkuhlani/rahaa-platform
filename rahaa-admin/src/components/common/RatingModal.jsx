import React, { useState } from 'react';
import { api } from '../../services/api';
import { Star, CheckCircle, AlertCircle, Send, Sparkles } from 'lucide-react';

export const RatingModal = ({ isOpen, onClose, entityType = 'trip', entityId, title = 'تقييم الخدمة', onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (entityType === 'trip') {
        await api.rateTrip(entityId, rating, review);
      } else if (entityType === 'rental') {
        await api.rateRentalBooking(entityId, rating, review);
      } else if (entityType === 'cargo') {
        await api.rateCargoRequest(entityId, rating, review);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'فشل إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-tajawal animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-rahaa-xl border border-rahaa-border text-center">
        {success ? (
          <div className="space-y-3 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
              شكراً لمشاركتنا تقييمك!
            </h3>
            <p className="text-xs text-rahaa-text-subtle">
              رأيك يساعدنا في تحسين جودة خدمات منصة راحة باستمرار
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-cairo font-bold text-lg text-rahaa-navy">
                {title}
              </h3>
              <p className="text-xs text-rahaa-text-subtle mt-0.5">
                كيف كانت تجربتك مع السائق ومستوى الخدمة؟
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Interactive Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-cairo font-bold text-amber-600 block">
              {rating === 5 ? 'ممتازة جداً ⭐⭐⭐⭐⭐' : rating === 4 ? 'جيدة جداً ⭐⭐⭐⭐' : rating === 3 ? 'متوسطة ⭐⭐⭐' : 'بحاجة لتحسين ⭐'}
            </span>

            {/* Comment Area */}
            <div>
              <textarea
                rows="3"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="اكتب ملاحظة أو تعليق اختياري..."
                className="w-full p-3 rounded-xl border border-rahaa-border bg-slate-50 text-xs focus:outline-none focus:bg-white"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 h-11 rounded-xl border border-rahaa-border font-cairo font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                تخطي
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 h-11 rounded-xl bg-rahaa-primary hover:bg-rahaa-navy text-white font-cairo font-bold text-xs flex items-center justify-center gap-2 shadow-rahaa-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
