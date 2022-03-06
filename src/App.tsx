import React from 'react';
import { Routes, Route, Link } from "react-router-dom";


import  QuoteList  from './lib/iex_quotes';

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import sectorsInfo from './data/sectors.json';
import { SectorData } from './types';


function App() {

  return (
    <div className="App">
      <header className="App-header">
        <p><a href='/'>IEX Demo</a></p>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
      </Routes>
      </header>
      <footer className="App-footer">
        <div><a href="https://iexcloud.io">Data provided by IEX Cloud</a></div>
      </footer>
    </div>
  );
}

function Home() {
  const data : SectorData[] = sectorsInfo;
  const symbols = data.map(sector => sector.symbol);
  console.log("App sectords:%o", sectorsInfo);
  console.log("App symbols:%o", symbols);

  return (
    <>
      <main className="App-main">
        <h2>Quotes</h2>
        <div><QuoteList dataMap={data} symbols={symbols} quotes={[]} stats={[]}  /></div>
      </main>
      <nav>
        <Link to="/about">About</Link>
      </nav>
    </>
  );
}

function About() {
  return (
    <>
      <main>
        <h2>davidk42 IEX Demo</h2>
      </main>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </>
  );
}

export default App;
