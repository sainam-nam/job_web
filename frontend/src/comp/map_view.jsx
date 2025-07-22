import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function MapView({ latitude, longitude, name , h }) {
  return (
    <MapContainer center={[latitude, longitude]} className="rounded-2xl overflow-hidden" zoom={30} style={{ height: h, width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="flex flex-col items-center text-center space-y-2">
            <div>{name}</div>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white border px-3 py-1 rounded-md hover:bg-blue-600"
            >
              เปิดใน Google Maps
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
