import React, {useEffect, useRef} from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

//  marker icon to locate stoppage 
const marker = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
  iconSize: [30, 30],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = ({ path, stoppages }) => {
 const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && path.length > 0) {
      const bounds = L.latLngBounds(path.map(p => [p.lat, p.lng]));
      stoppages.forEach(stop => {
        bounds.extend([stop.lat, stop.lng]);
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [path, stoppages]);
  return (
     <MapContainer ref={mapRef} center={[path[0]?.lat || 0, path[0]?.lng || 0]} zoom={10} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // serve map tiles at different zoom levels and coordinates
      />
      <Polyline positions={path.map(p => [p.lat, p.lng])} color="red" />
      {stoppages.map((stop, index) => (
        <Marker key={index} position={[stop.lat, stop.lng]} icon={marker}>
          <Popup>
            <div>
              <p>Reach Time: {stop.reachTime}</p>      
              <p>End Time: {stop.endTime}</p>
              <p>Duration: {stop.duration} minutes</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
