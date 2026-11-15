import { useCallback, useState } from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  Map as GoogleMap,
  Pin,
  useApiIsLoaded,
  useApiLoadingStatus,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';
import { LocateFixed, MapPin } from 'lucide-react';
import {
  DEMO_MAP_ID,
  GMP_ATTRIBUTION_IDS,
  GOOGLE_MAPS_API_KEY,
  DEFAULT_MAP_CENTER,
} from '../config/maps';
import { useLanguage } from '../contexts/LanguageContext';

interface MapLocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
}

export function MapLocationPicker({
  latitude,
  longitude,
  onChange,
}: MapLocationPickerProps) {
  const { t } = useLanguage();
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const isLoaded = useApiIsLoaded();
  const status = useApiLoadingStatus();

  const selectedPosition =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : null;

  const handleMapClick = useCallback(
    (ev: MapMouseEvent) => {
      if (ev.detail.latLng) {
        onChange(
          Number(ev.detail.latLng.lat.toFixed(6)),
          Number(ev.detail.latLng.lng.toFixed(6))
        );
        setGpsError(null);
      }
    },
    [onChange]
  );

  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setGpsError(
        'Geolocation is not supported by this browser. Please enter your landmark or tap the map manually.'
      );
      return;
    }

    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6))
        );
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(
            'GPS permission was denied. You can still select a point on the map or describe your landmark manually below.'
          );
        } else {
          setGpsError(
            'Unable to retrieve GPS coordinates right now. Please tap the map or enter manual landmark details.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const mapsUnavailable =
    !GOOGLE_MAPS_API_KEY ||
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleRequestGps}
          disabled={locating}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-900 transition-colors hover:bg-sky-100 disabled:opacity-60 cursor-pointer whitespace-nowrap"
        >
          <LocateFixed className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{locating ? t.report.gpsLoading : t.report.gpsBtn}</span>
        </button>

        {selectedPosition && (
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-mono tabular-nums">
              {selectedPosition.lat.toFixed(5)}, {selectedPosition.lng.toFixed(5)}
            </span>
            <button
              type="button"
              onClick={() => onChange(null, null)}
              className="text-sky-700 underline hover:text-sky-900 cursor-pointer"
            >
              Clear pin
            </button>
          </div>
        )}
      </div>

      {gpsError && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
          {gpsError}
        </p>
      )}

      <p className="text-xs text-slate-600">{t.report.manualCoordsHint}</p>

      {mapsUnavailable ? (
        <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-6 text-center">
          <MapPin className="h-7 w-7 text-slate-400 mb-2" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">
            Interactive map unavailable — manual landmark and coordinate entry active
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Default view centered; click the map or use GPS to set your exact location
          </p>
        </div>
      ) : !isLoaded ? (
        <div className="flex h-64 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500">
          Loading interactive map...
        </div>
      ) : (
        <div className="h-72 w-full overflow-hidden rounded-xl border border-slate-200">
          <GoogleMap
            mapId={DEMO_MAP_ID}
            defaultCenter={selectedPosition || DEFAULT_MAP_CENTER}
            defaultZoom={selectedPosition ? 15 : 5}
            gestureHandling="greedy"
            onClick={handleMapClick}
            internalUsageAttributionIds={GMP_ATTRIBUTION_IDS}
            style={{ width: '100%', height: '100%' }}
          >
            {selectedPosition && (
              <AdvancedMarker
                position={selectedPosition}
                title="Reported water issue location"
              >
                <Pin
                  background="#0284c7"
                  borderColor="#075985"
                  glyphColor="#ffffff"
                />
              </AdvancedMarker>
            )}
          </GoogleMap>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="manual-lat" className="block text-xs font-medium text-slate-700 mb-1">
            {t.report.latLabel}
          </label>
          <input
            id="manual-lat"
            type="number"
            step="0.000001"
            min="-90"
            max="90"
            value={latitude ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onChange(null, longitude);
              } else {
                const parsed = Number(val);
                if (!Number.isNaN(parsed)) onChange(parsed, longitude ?? DEFAULT_MAP_CENTER.lng);
              }
            }}
            placeholder="20.593700"
            className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
          />
        </div>
        <div>
          <label htmlFor="manual-lng" className="block text-xs font-medium text-slate-700 mb-1">
            {t.report.lngLabel}
          </label>
          <input
            id="manual-lng"
            type="number"
            step="0.000001"
            min="-180"
            max="180"
            value={longitude ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onChange(latitude, null);
              } else {
                const parsed = Number(val);
                if (!Number.isNaN(parsed)) onChange(latitude ?? DEFAULT_MAP_CENTER.lat, parsed);
              }
            }}
            placeholder="78.962900"
            className="w-full min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
          />
        </div>
      </div>
    </div>
  );
}
