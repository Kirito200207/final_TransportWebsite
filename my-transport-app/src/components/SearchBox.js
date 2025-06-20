import React, { useState } from 'react';

const SearchBox = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 处理搜索输入变化
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  // 处理搜索提交
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setIsLoading(true);
      
      // 获取地图实例
      if (window.BMapGL && window.map) {
        // 创建地址解析器实例
        const geoCoder = new window.BMapGL.Geocoder();
        
        // 将地址解析结果显示在地图上，并调整地图视野
        geoCoder.getPoint(searchValue.trim(), function(point) {
          if (point) {
            console.log(`地址"${searchValue}"解析成功，坐标:`, point);
            
            // 设置地图中心点
            window.map.centerAndZoom(point, 15);
            
            // 创建标记
            const marker = new window.BMapGL.Marker(point);
            
            // 将标记添加到地图中
            window.map.addOverlay(marker);
            
            // 添加信息窗口
            const infoWindow = new window.BMapGL.InfoWindow(
              `<div class="map-info">
                <h4>${searchValue}</h4>
                <p>Latitude: ${point.lat.toFixed(6)}</p>
                <p>Longitude: ${point.lng.toFixed(6)}</p>
              </div>`, 
              {
                width: 250,
                height: 100,
                title: "Location Information"
              }
            );
            
            marker.addEventListener('click', function() {
              window.map.openInfoWindow(infoWindow, point);
            });
            
          } else {
            console.error(`无法解析地址: ${searchValue}`);
            alert(`Cannot find location: ${searchValue}`);
          }
          
          setIsLoading(false);
        }, function(error) {
          console.error("地址解析失败:", error);
          alert(`Failed to search location: ${error}`);
          setIsLoading(false);
        });
      } else {
        alert("地图尚未加载完成，请稍后再试");
        setIsLoading(false);
      }
    }
  };

  // 处理回车键搜索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSearch(e);
    }
  };

  return (
    <div className="destination-search">
      <div className="search-container">
        <form id="iptbox" onSubmit={handleSearch}>
          <button 
            id="scanbtn1" 
            className="scanbtn" 
            onClick={handleSearch}
            type="submit"
            aria-label="Search"
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img className="searchlogo" src="/img2/search.png" alt="search" />
          </button>
          <input 
            type="text" 
            placeholder="Search for location (e.g. Chengdu)" 
            maxLength="1024" 
            value={searchValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <div id="scanbtn2" className="scanbtn">
            <img className="scanlogo" src="/img2/扫描 (1).png" alt="scan" />
          </div>
          <div id="micbtn" className="micbtn">
            <img className="miclogo" src="/img2/麦克风开 (2).png" alt="mic" />
          </div>
        </form>
      </div>
      {isLoading && searchValue && (
        <div className="search-loading-indicator">Searching...</div>
      )}
    </div>
  );
};

export default SearchBox; 