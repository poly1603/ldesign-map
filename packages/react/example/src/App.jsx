import React, { useEffect, useRef, useState } from 'react';
import { Deck } from '@deck.gl/core';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import './App.css';

function App() {
  const deckRef = useRef(null);
  const [layers, setLayers] = useState([]);

  const cities = [
    { position: [116.4074, 39.9042], color: [255, 0, 0] },
    { position: [121.4737, 31.2304], color: [0, 128, 255] },
    { position: [113.2644, 23.1291], color: [255, 165, 0] }
  ];

  const path = [
    [116.4074, 39.9042],
    [121.4737, 31.2304],
    [113.2644, 23.1291]
  ];

  useEffect(() => {
    deckRef.current = new Deck({
      container: 'map',
      initialViewState: {
        longitude: 116.4074,
        latitude: 39.9042,
        zoom: 5
      },
      controller: true
    });
    
    setTimeout(() => {
      addPoints();
      addPath();
    }, 500);
    
    return () => {
      deckRef.current?.finalize();
    };
  }, []);

  useEffect(() => {
    if (deckRef.current) {
      deckRef.current.setProps({ layers });
    }
  }, [layers]);

  const addPoints = () => {
    const layer = new ScatterplotLayer({
      id: 'points',
      data: cities,
      getPosition: d => d.position,
      getRadius: 50000,
      getFillColor: d => d.color,
      radiusMinPixels: 10
    });
    
    setLayers(prev => [...prev.filter(l => l.id !== 'points'), layer]);
  };

  const addPath = () => {
    const layer = new PathLayer({
      id: 'path',
      data: [{ path }],
      getPath: d => d.path,
      getColor: [80, 180, 230, 255],
      getWidth: 5
    });
    
    setLayers(prev => [...prev.filter(l => l.id !== 'path'), layer]);
  };

  const clearMap = () => {
    setLayers([]);
  };

  return (
    <div className="app">
      <h1>🗺️ React Map Example</h1>
      <div id="map"></div>
      <div className="controls">
        <button onClick={addPoints}>添加散点</button>
        <button onClick={addPath}>添加路径</button>
        <button onClick={clearMap}>清除</button>
      </div>
    </div>
  );
}

export default App;
