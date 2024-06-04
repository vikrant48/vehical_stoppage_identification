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
      time: new Date(point.eventGeneratedTime),
      speed: parseFloat(point.speed)
    }));
    setPath(path);

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
    setStoppages(stoppages);
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
    </div>
    </>
  )
}

export default App


