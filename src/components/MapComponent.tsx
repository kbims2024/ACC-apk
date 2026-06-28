import React, { useEffect, useState, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, InfoWindow, useAdvancedMarkerRef, useMap } from "@vis.gl/react-google-maps";
import { User, MapPin, Star } from "lucide-react";

interface Worker {
  _id: string;
  name: string;
  profession: string;
  location: string;
  country?: string;
  photo?: string;
  companyName?: string;
  entityType?: string;
  rating: number;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

function GeoMarker({ worker }: { worker: Worker }) {
  const geocodingLib = useMapsLibrary("geocoding");
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!geocodingLib || !worker.location) return;

    // Small pseudo-random offset so workers in the same city don't completely overlap
    const pseudoRandomOffset = () => (Math.random() - 0.5) * 0.02;

    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address: `${worker.location}, ${worker.country || ""}` }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        setPosition({ lat: lat + pseudoRandomOffset(), lng: lng + pseudoRandomOffset() });
      }
    });
  }, [geocodingLib, worker]);

  if (!position) return null;

  return (
    <>
      <AdvancedMarker ref={markerRef} position={position} onClick={() => setOpen(true)}>
        <Pin background="#4f46e5" glyphColor="#fff" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="flex items-center gap-3 p-1 min-w-[200px]">
             {worker.photo ? (
                <img src={worker.photo} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-slate-100 rounded-full flex justify-center items-center font-bold text-slate-500">
                  {(worker.companyName || worker.name).charAt(0).toUpperCase()}
                </div>
              )}
            <div className="flex-1">
              <strong className="text-slate-900 block">{(worker.entityType === 'company' && worker.companyName) ? worker.companyName : worker.name}</strong>
              <div className="flex items-center justify-between mt-1">
                 <span className="text-xs text-slate-500">{worker.profession || "Polyvalent"}</span>
                 <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {worker.rating > 0 ? worker.rating : "Nouveau"}
                 </div>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function UserLocationMarker({ userPos }: { userPos: { lat: number, lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !userPos) return;
    map.setCenter(userPos);
    map.setZoom(12);
  }, [map, userPos]);

  if (!userPos) return null;

  return (
    <AdvancedMarker position={userPos} title="Votre position">
        <Pin background="#0ea5e9" glyphColor="#fff" />
    </AdvancedMarker>
  )
}

export default function MapComponent({ workers, userLocation }: { workers: Worker[], userLocation?: { lat: number, lng: number } | null }) {
  if (!hasValidKey) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl h-[400px] flex items-center justify-center p-6 text-center border border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Carte Indisponible</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">La clé API Google Maps n'est pas configurée.</p>
          <p className="text-sm text-slate-500">
            <strong>Pour l'ajouter:</strong>
            <br />
            1. Obtenez une clé API depuis Google Cloud
            <br />
            2. Ouvrez les <strong>Settings</strong> ⚙️ et ajoutez la variable <code>GOOGLE_MAPS_PLATFORM_KEY</code>
            <br />
            3. Le projet se rechargera automatiquement
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative z-0">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: 7.539989, lng: -5.54708 }} // Default center Ivory Coast
          defaultZoom={6}
          mapId="ARTISANCHAPCHAP_SEARCH_MAP"
          internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          style={{ width: "100%", height: "100%" }}
          options={{
           gestureHandling: "greedy",
          }}
        >
          <UserLocationMarker userPos={userLocation || null} />
          {workers.map((worker) => (
            // @ts-ignore
            <GeoMarker key={worker._id} worker={worker} />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
