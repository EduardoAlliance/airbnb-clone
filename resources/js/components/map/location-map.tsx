import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    title?: string;
    className?: string;
}

const defaultIcon = L.divIcon({
    className: '',
    html: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B6B38" stroke="#2D552E" stroke-width="2"/><circle cx="12" cy="9" r="3" fill="white"/></svg>',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
});

export function LocationMap({ latitude, longitude, title, className = '' }: LocationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const map = L.map(mapRef.current, {
            center: [latitude, longitude],
            zoom: 15,
            scrollWheelZoom: false,
            zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.marker([latitude, longitude], { icon: defaultIcon })
            .addTo(map)
            .bindPopup(title ?? '');

        mapInstance.current = map;

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, [latitude, longitude, title]);

    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.setView([latitude, longitude], 15);
            mapInstance.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    layer.setLatLng([latitude, longitude]);
                }
            });
        }
    }, [latitude, longitude]);

    return (
        <div ref={mapRef} className={`w-full rounded-xl overflow-hidden isolate ${className}`} />
    );
}
