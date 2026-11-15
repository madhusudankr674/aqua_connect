import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LogIn,
  Trash2,
} from 'lucide-react';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { ScientificDisclaimer } from '../components/ScientificDisclaimer';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { submitComplaint } from '../services/complaintService';
import { uploadComplaintPhotographs } from '../services/storageService';
import {
  compressImage,
  formatFileSize,
  type CompressedImageResult,
} from '../utils/imageProcessor';
import {
  extractMobileLast4,
  MAX_IMAGE_FILES,
  sanitizeMobile,
  VALID_CATEGORIES,
  VALID_WARDS,
  validateComplaintInput,
  validateImageFiles,
  type ValidationErrors,
} from '../services/validation';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintWard,
} from '../types/complaint';

function getLocalDatetimeDefault(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export function ReportIssuePage() {
  const { t } = useLanguage();
  const { firebaseUser, profile, signInWithGoogle } = useAuth();

  const [citizenName, setCitizenName] = useState('');
  const [mobile, setMobile] = useState('');
  const [ward, setWard] = useState<ComplaintWard>('Ward 2');
  const [locality, setLocality] = useState('Herooru');
  const [category, setCategory] = useState<ComplaintCategory>('Muddy or cloudy water');
  const [observationDate, setObservationDate] = useState(getLocalDatetimeDefault);
  const [continuingIssue, setContinuingIssue] = useState(true);
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedPreviews, setCompressedPreviews] = useState<CompressedImageResult[]>([]);
  const [compressingImages, setCompressingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<Complaint | null>(null);

  useEffect(() => {
    if (profile) {
      setCitizenName((prev) => prev || profile.name || '');
      setMobile((prev) => prev || profile.mobile || '');
      if (profile.locality && profile.locality !== 'Herooru Grama Panchayat') {
        setLocality((prev) => (prev === 'Herooru' ? profile.locality : prev));
      }
    }
  }, [profile]);

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(ev.target.files || []);
    ev.target.value = '';
    if (incoming.length === 0) return;

    const combinedRaw = [...selectedFiles, ...incoming];
    const validationMsg = validateImageFiles(combinedRaw);
    if (validationMsg) {
      setUploadError(validationMsg);
      return;
    }

    setUploadError(null);
    setCompressingImages(true);
    try {
      const results = await Promise.all(
        incoming.map((file) => compressImage(file, 800, 0.7))
      );
      setSelectedFiles((prev) => [...prev, ...results.map((r) => r.file)]);
      setCompressedPreviews((prev) => [...prev, ...results]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Unable to compress selected photograph.'
      );
    } finally {
      setCompressingImages(false);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setCompressedPreviews((prev) => prev.filter((_, i) => i !== idx));
    setUploadError(null);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);

    if (!firebaseUser) {
      setSubmitError('Please sign in with Google before submitting your water issue report.');
      return;
    }

    const input = {
      citizenName,
      mobile,
      ward,
      locality,
      category,
      description,
      latitude,
      longitude,
      landmark,
      observationDate,
      continuingIssue,
    };

    const formErrors = validateComplaintInput(input);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const tempIdPrefix = `AQ-${new Date().getFullYear()}-${ward.replace(/\s+/g, '')}`;
      const imageUrls = await uploadComplaintPhotographs(tempIdPrefix, selectedFiles);

      const created = await submitComplaint({
        citizenUid: firebaseUser.uid,
        input,
        imageUrls,
      });

      setSubmittedRecord(created);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to submit report. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setCompressedPreviews([]);
    setDescription('');
    setLandmark('');
    setLatitude(null);
    setLongitude(null);
    setObservationDate(getLocalDatetimeDefault());
    setSubmittedRecord(null);
    setErrors({});
    setSubmitError(null);
  };

  if (submittedRecord) {
    const last4 = extractMobileLast4(submittedRecord.mobile);
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                {t.report.successTitle}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600">{t.report.successSubtitle}</p>
            </div>
          </div>

          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">{t.report.complaintIdLabel}</p>
              <p className="mt-1 font-mono text-lg font-bold text-sky-900 tabular-nums select-all">
                {submittedRecord.complaintId}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.report.verifyHintLabel}</p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                {last4}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.report.wardLabel}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {submittedRecord.ward} · {submittedRecord.locality}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{t.report.categoryLabel}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {t.categories[submittedRecord.category]}
              </p>
            </div>
          </div>

          <ScientificDisclaimer compact />

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/track?id=${encodeURIComponent(submittedRecord.complaintId)}&last4=${encodeURIComponent(last4)}`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 whitespace-nowrap"
            >
              {t.report.trackNowBtn}
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              {t.report.reportAnotherBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t.report.title}
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">{t.report.subtitle}</p>
      </div>

      <ScientificDisclaimer compact />

      {!firebaseUser && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              {t.report.signInPromptTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-700">{t.report.signInPromptDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 cursor-pointer whitespace-nowrap"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>{t.report.signInBtn}</span>
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8"
      >
        {/* 1. Citizen Details */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            {t.report.citizenSection}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="citizen-name" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.nameLabel} *
              </label>
              <input
                id="citizen-name"
                type="text"
                required
                maxLength={100}
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Ramesh Gowda"
                className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {errors.citizenName && (
                <p className="mt-1 text-xs text-rose-700">{errors.citizenName}</p>
              )}
            </div>

            <div>
              <label htmlFor="citizen-mobile" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.mobileLabel} *
              </label>
              <input
                id="citizen-mobile"
                type="tel"
                required
                maxLength={15}
                value={mobile}
                onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
                placeholder="e.g. 9845012345"
                className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {errors.mobile && <p className="mt-1 text-xs text-rose-700">{errors.mobile}</p>}
            </div>

            <div>
              <label htmlFor="citizen-ward" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.wardLabel} *
              </label>
              <select
                id="citizen-ward"
                value={ward}
                onChange={(e) => setWard(e.target.value as ComplaintWard)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              >
                {VALID_WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w === 'Ward 2' || w === 'Ward 4' ? `${w} (Pilot Ward)` : w}
                  </option>
                ))}
              </select>
              {errors.ward && <p className="mt-1 text-xs text-rose-700">{errors.ward}</p>}
            </div>

            <div>
              <label htmlFor="citizen-locality" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.localityLabel} *
              </label>
              <input
                id="citizen-locality"
                type="text"
                required
                maxLength={120}
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Herooru Main Road"
                className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {errors.locality && <p className="mt-1 text-xs text-rose-700">{errors.locality}</p>}
            </div>
          </div>
        </section>

        {/* 2. Observation Details */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            {t.report.observationSection}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="obs-category" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.categoryLabel} *
              </label>
              <select
                id="obs-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              >
                {VALID_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t.categories[cat]}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-rose-700">{errors.category}</p>}
            </div>

            <div>
              <label htmlFor="obs-date" className="block text-sm font-medium text-slate-800 mb-1.5">
                {t.report.dateLabel} *
              </label>
              <input
                id="obs-date"
                type="datetime-local"
                required
                value={observationDate}
                onChange={(e) => setObservationDate(e.target.value)}
                className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
              />
              {errors.observationDate && (
                <p className="mt-1 text-xs text-rose-700">{errors.observationDate}</p>
              )}
            </div>
          </div>

          <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={continuingIssue}
              onChange={(e) => setContinuingIssue(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
            />
            <span className="text-sm font-medium text-slate-800">
              {t.report.continuingLabel}
            </span>
          </label>

          <div>
            <label htmlFor="obs-desc" className="block text-sm font-medium text-slate-800 mb-1.5">
              {t.report.descriptionLabel} *
            </label>
            <textarea
              id="obs-desc"
              rows={4}
              required
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed (e.g., water from morning tap supply was muddy brown for 20 minutes near the community tank)..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{errors.description ? <span className="text-rose-700">{errors.description}</span> : 'Minimum 10 characters'}</span>
              <span className="font-mono tabular-nums">{description.length}/2000</span>
            </div>
          </div>
        </section>

        {/* 3. Location & Landmark */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            {t.report.locationSection}
          </h2>
          <div>
            <label htmlFor="obs-landmark" className="block text-sm font-medium text-slate-800 mb-1.5">
              {t.report.landmarkLabel} *
            </label>
            <input
              id="obs-landmark"
              type="text"
              required
              maxLength={200}
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Government Primary School / Anganwadi Borewell Tap"
              className="w-full min-h-[44px] rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            {errors.landmark && <p className="mt-1 text-xs text-rose-700">{errors.landmark}</p>}
          </div>

          <MapLocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
          {errors.coordinates && (
            <p className="text-xs text-rose-700">{errors.coordinates}</p>
          )}
        </section>

        {/* 4. Photograph Upload */}
        <section className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
            {t.report.photosSection}
          </h2>
          <p className="text-xs text-slate-600">{t.report.photosHint}</p>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer">
              <ImagePlus className="h-4 w-4 text-sky-700" aria-hidden="true" />
              <span>
                {compressingImages
                  ? 'Optimizing photograph...'
                  : `Select Photographs (${selectedFiles.length}/${MAX_IMAGE_FILES})`}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={compressingImages || selectedFiles.length >= MAX_IMAGE_FILES}
                onChange={(e) => void handleFileChange(e)}
                className="sr-only"
              />
            </label>
          </div>

          {uploadError && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              {uploadError}
            </p>
          )}

          {compressedPreviews.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {compressedPreviews.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <div className="relative">
                    <img
                      src={item.dataUrl}
                      alt={`Uploaded water observation preview ${idx + 1}`}
                      className="h-40 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      aria-label={`Remove photograph ${idx + 1}`}
                      className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-rose-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-slate-600 font-mono tabular-nums">
                    <span>
                      {formatFileSize(item.originalSize)} &rarr; {formatFileSize(item.compressedSize)}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      -{item.reductionPercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-700" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !firebaseUser}
            className="w-full sm:w-auto min-h-[48px] rounded-lg bg-sky-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? t.report.submittingBtn : t.report.submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
