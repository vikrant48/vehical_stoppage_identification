import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

//  marker icon to locate stoppage 
const marker = new L.Icon({
  iconUrl: 'https://www.flaticon.com/free-icon/location_535188', 
  iconSize: [30, 30],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = ({ path, stoppages }) => {
  return (
    <MapContainer center={[path[0].lat, path[0].lng]} zoom={10} style={{ height: "80vh", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // serve map tiles at different zoom levels and coordinates
      />
      <Polyline positions={path.map(p => [p.lat, p.lng])} color="red" />
      {stoppages.map((stop, index) => (
        <Marker key={index} position={[stop.lat, stop.lng]} icon={marker}>
           { 'stoppage'}
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
