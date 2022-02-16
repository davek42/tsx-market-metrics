import React from 'react';


import  QuoteList  from './lib/iex_quotes';

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import sectorsInfo from './data/sectors.json';
import { SectorData } from './types';





function App() {
  console.log("App sectords:%o", sectorsInfo);
  const data : SectorData[] = sectorsInfo;
  const symbols = data.map(sector => sector.symbol);
  console.log("App symbols:%o", symbols);

  return (
    <div className="App">
      <header className="App-header">
        <p><a href='/'>IEX Demo</a></p>
        
        <div><QuoteList dataMap={data} symbols={symbols} quotes={[]} stats={[]}  /></div>
      </header>
      <footer className="App-footer">
        <div><a href="https://iexcloud.io">Data provided by IEX Cloud</a></div>
      </footer>
    </div>
  );
}

export default App;
