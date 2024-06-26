import './App.css'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Mapfunction from './map';

function App() {
  const [data,setData] = useState([]);
  const [path, setPath] = useState([]);
  const [stoppages, setStoppages] = useState([]);
  const [threshold, setThreshold] = useState(5); // Default threshold in minutes

  useEffect(() => {
    // Fetch GPS data
    axios.get('https://docs.google.com/spreadsheets/d/1Lro5MJbxHtbjEg4TLuO6qTs5sPYL6DmqbQNJOEtiGPQ/export?format=csv')
      .then(response => {
        const csvData = response.data;
        const parsedData = parseCSV(csvData);
        setData(parsedData);
        processGPSData(parsedData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const parseCSV = (csv) => {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(',');

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  };

  const processGPSData = (gpsData) => {
    const path = gpsData.map(point => ({
      lat: parseFloat(point.latitude),
      lng: parseFloat(point.longitude),
      time: new Date(Number(point.eventGeneratedTime)),
      speed: parseFloat(point.speed)
    }));
    setPath(path);
    console.log("Path Data: ", path); // Logging path data for debugging

    const stoppages = [];
    let stopStart = null;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      if (curr.speed === 0) {
        if (!stopStart) stopStart = prev;
      } else if (stopStart) {
        const duration = (curr.time - stopStart.time) / 60000; 
        if (duration >= threshold) {
          stoppages.push({
            lat: stopStart.lat,
            lng: stopStart.lng,
            reachTime: stopStart.time.toLocaleString(),
            endTime: curr.time.toLocaleString(),
            duration: duration.toFixed(4)
          });
        }
        stopStart = null;
      }
    }
    // Check for an ongoing stoppage at the end of the data
    if (stopStart) {
      const duration = (path[path.length - 1].time - stopStart.time) / 60000;
      if (duration >= threshold) {
        stoppages.push({
          lat: stopStart.lat,
          lng: stopStart.lng,
          reachTime: stopStart.time.toLocaleString(),
          endTime: path[path.length - 1].time.toLocaleString(),
          duration: duration.toFixed(4)
        });
      }
    }
    setStoppages(stoppages);
    console.log('Stoppages:', stoppages); // Debugging output
  };

  

  return (
    <>
      <div>
      <h1>Vehicle Stoppage Identification And Visualization</h1>
      <label>
        Stoppage Threshold (minutes):
        <br />
        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
        <p>This assignment is done by vikrant chauhan </p>
      </label>
      {path.length > 0 && <Mapfunction path={path} stoppages={stoppages} />}
      {stoppages.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Reach Time</th>
                <th>End Time</th>
                <th>Duration (minutes)</th>
              </tr>
            </thead>
            <tbody>
              {stoppages.map((stop, index) => (
                <tr key={index}>
                  <td>{stop.lat}</td>
                  <td>{stop.lng}</td>
                  <td>{stop.reachTime}</td>
                  <td>{stop.endTime}</td>
                  <td>{stop.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
    </>
  );
}

export default App


