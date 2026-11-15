import { useState } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiIsLoaded,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import {
  DEMO_MAP_ID,
  GMP_ATTRIBUTION_IDS,
  GOOGLE_MAPS_API_KEY,
  HEROORU_DEFAULT_CENTER,
} from '../config/maps';
import { getStatusStyle } from '../services/workflow';
import type { Complaint } from '../types/complaint';

function ComplaintMarker({
  complaint,
  onSelect,
}: {
  complaint: Complaint;
  onSelect: (c: Complaint) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  if (complaint.latitude === null || complaint.longitude === null) {
    return null;
  }

  const style = getStatusStyle(complaint.status);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: complaint.latitude, lng: complaint.longitude }}
        title={`${complaint.complaintId} - ${complaint.category}`}
        onClick={() => setOpen(true)}
      >
        <Pin
          background={style.pinBg}
          borderColor={style.pinBorder}
          glyphColor="#ffffff"
        />
      </AdvancedMarker>

      {open && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setOpen(false)}
        >
          <div className="space-y-1.5 p-1 text-slate-900">
            <p className="font-mono text-xs font-semibold text-sky-800">
              {complaint.complaintId}
            </p>
            <p className="text-sm font-semibold">{complaint.category}</p>
            <p className="text-xs text-slate-600">
              {complaint.ward} · {complaint.locality}
            </p>
            <p className="text-xs text-slate-500">{complaint.landmark}</p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(complaint);
              }}
              className="mt-1 inline-block rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-800 cursor-pointer"
            >
              Inspect Complaint
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function EngineerComplaintsMap({
  complaints,
  onSelectComplaint,
}: {
  complaints: Complaint[];
  onSelectComplaint: (c: Complaint) => void;
}) {
  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();

  const geocoded = complaints.filter(
    (c) =>
      typeof c.latitude === 'number' &&
      typeof c.longitude === 'number' &&
      !Number.isNaN(c.latitude) &&
      !Number.isNaN(c.longitude)
  );

  const center =
    geocoded.length > 0 && geocoded[0].latitude !== null && geocoded[0].longitude !== null
      ? { lat: geocoded[0].latitude, lng: geocoded[0].longitude }
      : HEROORU_DEFAULT_CENTER;

  if (
    !GOOGLE_MAPS_API_KEY ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <MapPin className="h-7 w-7 text-slate-400 mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-700">
          Map view is currently unavailable. Use the complaint table below to view landmarks and GPS coordinates.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Loading ward complaint map...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          Showing <strong className="tabular-nums text-slate-900">{geocoded.length}</strong> geocoded
          complaints across Herooru Grama Panchayat
        </span>
        <span>Click any pin to inspect complaint details</span>
      </div>
      <div className="h-80 w-full overflow-hidden rounded-xl border border-slate-200">
        <GoogleMap
          mapId={DEMO_MAP_ID}
          defaultCenter={center}
          defaultZoom={13}
          gestureHandling="greedy"
          internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
          style={{ width: '100%', height: '100%' }}
        >
          {geocoded.map((complaint) => (
            <ComplaintMarker
              key={complaint.complaintId}
              complaint={complaint}
              onSelect={onSelectComplaint}
            />
          ))}
        </GoogleMap>
      </div>
    </div>
  );
}
