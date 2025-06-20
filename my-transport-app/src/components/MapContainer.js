import React, { useEffect, useRef, useState } from 'react';

const MapContainer = () => {
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 确保BMapGL已经加载
    if (window.BMapGL) {
      try {
        setIsLoading(true);
        // 初始化地图
        const map = new window.BMapGL.Map(mapRef.current);
        const point = new window.BMapGL.Point(60.6057, 56.8389);
        map.centerAndZoom(point, 15);
        
        // 将地图实例保存到window对象，以便其他组件可以访问
        window.map = map;
        
        // 启用滚轮缩放
        map.enableScrollWheelZoom(true);
        
        // 添加控件
        map.addControl(new window.BMapGL.ScaleControl());
        map.addControl(new window.BMapGL.ZoomControl());
        
        // 添加一些标记点
        addMarkers(map);
        
        setIsLoading(false);
      } catch (err) {
        console.error("地图加载失败:", err);
        setError("地图加载失败，请刷新页面重试。");
        setIsLoading(false);
      }
    } else {
      setError("百度地图API未加载，请检查网络连接。");
      setIsLoading(false);
    }
  }, []);
  
  // 添加标记点
  const addMarkers = (map) => {
    // 公交站点
    const busStops = [
      { lng: 60.6057, lat: 56.8389, title: "Central Station", type: "bus" },
      { lng: 60.6157, lat: 56.8459, title: "North Square", type: "tram" },
      { lng: 60.5957, lat: 56.8329, title: "West Mall", type: "bus" },
      { lng: 60.6157, lat: 56.8329, title: "East Station", type: "tram" },
    ];
    
    busStops.forEach(stop => {
      const point = new window.BMapGL.Point(stop.lng, stop.lat);
      const marker = new window.BMapGL.Marker(point);
      map.addOverlay(marker);
      
      // 添加信息窗口
      const infoWindow = new window.BMapGL.InfoWindow(
        `<div class="map-info">
          <h4>${stop.title}</h4>
          <p>Type: ${stop.type === 'bus' ? 'Bus Stop' : 'Tram Stop'}</p>
          <p>Next arrival: 5 min</p>
        </div>`, 
        {
          width: 200,
          height: 100,
          title: stop.title
        }
      );
      
      marker.addEventListener('click', function() {
        map.openInfoWindow(infoWindow, point);
      });
    });
  };
  
  return (
    <div className="map-wrapper">
      <div ref={mapRef} className="map-container"></div>
      {isLoading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      )}
      {error && (
        <div className="map-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default MapContainer; 