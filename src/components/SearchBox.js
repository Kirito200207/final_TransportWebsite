import React from 'react';

const SearchBox = () => {
  return (
    <div className="destination-search">
      <div className="search-container">
        <div id="iptbox">
          <div id="scanbtn1" className="scanbtn">
            <img className="searchlogo" src="/img2/search.png" alt="search" />
          </div>
          <input type="text" placeholder="Look for your destination" maxLength="1024" />
          <div id="scanbtn2" className="scanbtn">
            <img className="scanlogo" src="/img2/扫描 (1).png" alt="scan" />
          </div>
          <div id="micbtn" className="micbtn">
            <img className="miclogo" src="/img2/麦克风开 (2).png" alt="mic" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox; 