import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
    address?: string;
    className?: string;
}

const defaultCenter: [number, number] = [25.6866, -100.3161];

const markerIcon = L.divIcon({
    className: '',
    html: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B6B38" stroke="#2D552E" stroke-width="2"/>
        <circle cx="12" cy="9" r="3" fill="white"/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
});

export function MapPicker({ latitude, longitude, onChange, address, className = '' }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const hasCoords = latitude !== null && longitude !== null;

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const center: [number, number] = hasCoords ? [latitude!, longitude!] : defaultCenter;

        const map = L.map(mapRef.current, {
            center,
            zoom: hasCoords ? 15 : 5,
            scrollWheelZoom: true,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker(center, { icon: markerIcon, draggable: true }).addTo(map);

        marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChange(pos.lat, pos.lng);
        });

        map.on('click', (e: L.LeafletMouseEvent) => {
            marker.setLatLng(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
        });

        markerRef.current = marker;
        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
            markerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (mapInstance.current && markerRef.current && hasCoords) {
            markerRef.current.setLatLng([latitude!, longitude!]);
            mapInstance.current.setView([latitude!, longitude!], 15);
        }
    }, [latitude, longitude, hasCoords]);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
                { headers: { 'Accept-Language': 'en' } },
            );
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);
                onChange(latNum, lonNum);
                setSearchQuery(display_name);
            }
        } catch {
            // ignore
        } finally {
            setSearching(false);
        }
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={address ? `Search or drag pin… (${address})` : 'Search location…'}
                    className="flex-1 border border-stitch-outline-variant rounded-lg px-3 py-2 text-body-md bg-transparent focus:outline-none focus:border-stitch-primary"
                />
                <button
                    type="submit"
                    disabled={searching}
                    className="bg-stitch-primary text-stitch-on-primary px-4 py-2 rounded-lg text-label-md hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {searching ? '…' : 'Search'}
                </button>
            </form>

            <div ref={mapRef} className={`w-full h-[320px] rounded-xl border border-stitch-outline-variant/30 z-0 ${className}`} />

            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-label-sm text-stitch-on-surface-variant mb-1">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        value={latitude ?? ''}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && longitude !== null) onChange(v, longitude);
                        }}
                        placeholder="25.6866"
                        className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 text-body-md bg-transparent focus:outline-none focus:border-stitch-primary"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-label-sm text-stitch-on-surface-variant mb-1">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={longitude ?? ''}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!isNaN(v) && latitude !== null) onChange(latitude, v);
                        }}
                        placeholder="-100.3161"
                        className="w-full border border-stitch-outline-variant rounded-lg px-3 py-2 text-body-md bg-transparent focus:outline-none focus:border-stitch-primary"
                    />
                </div>
            </div>
        </div>
    );
}
