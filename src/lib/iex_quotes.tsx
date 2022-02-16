import React, {Component} from 'react';
import { Row  } from "react-bootstrap";
//import { Col  } from "react-bootstrap";
import { Container } from "react-bootstrap";
import { QuoteListProps } from '../types';
import { QuoteListState } from '../types';
import { SectorData } from '../types';


import "bootstrap/dist/css/bootstrap.min.css";
//import { UsePlaceholderProps } from 'react-bootstrap/esm/usePlaceholder';
//

function formatChange(value: number) {
  if (value === null || value === undefined) return '';
  return value.toLocaleString('en', {'minimumFractionDigits': 2});
}

function formatChangePercent(value:number) {
  if (value === null || value === undefined) return '';
  return (value * 100).toFixed(1) + '%';
}

function formatQuote(value:number) {
  let options = {
    'minimumFractionDigits': 2,
    'style': 'currency',
    'currency': 'USD'
  };
  return value.toLocaleString('en', options);
}

interface QuoteProps {
  symbol: string;
  data:any;
  onChange: (symbol:string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

class Quote extends Component <QuoteProps,{}> {

  constructor(props:QuoteProps) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    console.log("Quote props:%o", props);
  }

  handleClick(symbol:string, event:any) {
    console.log("Quote handleClick: sym:%o event:%o",symbol, event);
    this.props.onChange(symbol, event);
  }

  render() {
    const sym = this.props.symbol;
    return (
        <tr >
        <td><div onClick={(e) => this.handleClick(sym,e)}>{sym}</div></td>
        <td>{formatQuote(this.props.data.quote.latestPrice)}</td>
        <td>{formatChange(this.props.data.quote.change)}</td>
        <td>{formatChangePercent(this.props.data.quote.changePercent)}</td>
        <td>{formatChangePercent(this.props.data.stats.day5ChangePercent)}</td>
        <td>{formatChangePercent(this.props.data.stats.day30ChangePercent)}</td>
        <td>{formatChangePercent(this.props.data.stats.month3ChangePercent)}</td>
        <td>{formatQuote(this.props.data.stats.day50MovingAvg)}</td>
        <td>{formatQuote(this.props.data.stats.day200MovingAvg)}</td>
        </tr>
    );
  }

}


/* 
 * Main component  for listing quotes
*/
class QuoteList extends Component<QuoteListProps,QuoteListState> {
  constructor(props:QuoteListProps) {
    super(props);
    const symbols = props.dataMap.map((sector:SectorData) => sector.symbol);
    console.log("symbols:%o", symbols);
    console.log("QL props:%o", props);
    console.log("QL symbols:%o", props.symbols);
    console.log("QL dataMap:%o", props.dataMap);

    this.state = {
      level: 0,
      quotes: [],
      stats: [],
      dataMap : props.dataMap,
      symbols: symbols || [],
    }
    this.handleChange = this.handleChange.bind(this);
  }

  state:Readonly<QuoteListState> = {
    level: 0,
    quotes: [],
    stats: [],
    symbols: [],
    dataMap: [],
  }

  getIEXBaseUrl() {
    const useSandbox = process.env.REACT_APP_USE_SANDBOX === 'true';
    console.log("sandbox:%o  raw:%o", useSandbox, process.env.REACT_APP_USE_SANDBOX);
    return useSandbox ? 'https://sandbox.iexapis.com/v1' : 'https://cloud.iexapis.com/v1';
  }

  buildIEXUrl(symbols:string[], filters:string[]) {
    const API_TOKEN = process.env.REACT_APP_IEX_TOKEN;
    let baseUrl = this.getIEXBaseUrl();
    let url = `${baseUrl}/stock/market/batch?symbols=${symbols.join(',')}&types=quote,stats&filter=${filters.join(',')}&token=${API_TOKEN}`;
    console.log("url: %o ", url);
    return url;
  }
 
  // SYMS=XLU,XLC,XLRE
  // curl -k "https://cloud.iexapis.com/stable/stock/market/batch?symbols=$SYMS&types=stats&token=$TOKEN"
  buildStatUrl(symbols:string[], filters:string[]) {
    const API_TOKEN = process.env.REACT_APP_IEX_TOKEN;
    let baseUrl = this.getIEXBaseUrl();
    let url = `${baseUrl}/stock/market/batch?symbols=${symbols.join(',')}&types=stats&token=${API_TOKEN}`;
    if(filters.length > 0) {
      url += `&filter=${filters.join(',')}`;
    }
    console.log("url: %o ", url);
    return url;
  }

  buildFinvizUrl(symbol:string) {
    let url = `https://finviz.com/quote.ashx?t=${symbol}`;
    return url;
  }

  getQuotes() {
    const symbols = this.state.symbols;
    console.log("getQuotes:%o", symbols);
    if(symbols.length === 0) return;
    let quote_qfilters = ['symbol','latestPrice', 'change', 'changePercent', 'marketCap'];
    let stat_filters = ['symbol','maxChangePercent', 'year5ChangePercent', 'year2ChangePercent', 'year1ChangePercent',
      'ytdChangePercent','month6ChangePercent','month3ChangePercent','month1ChangePercent',
      'day30ChangePercent','day5ChangePercent',
      'day50MovingAvg','day200MovingAvg'];

    let filters = quote_qfilters.concat(stat_filters);
    let url = this.buildIEXUrl(symbols, filters);

    fetch(url).then(response => response.json()).then(json => {
      console.log("JSON:%o",json);
      // retire this code
      var qq:any[] = [];
      symbols.forEach((symbol:string) => {
        //var data = json[symbol].quote;
        var data = json[symbol];
        data.symbol = symbol;
        console.log("data:%o", data);
        let price = data.latestPrice;
        console.log("symol:%o price: %o ", symbol, price);
        qq.push(data);
      });
      console.log("qq:%o", qq);
      this.setState({ quotes: qq });
    }).catch(error => {
      console.log("error:%o", error);
    });
    console.log("quotes:%o", this.state.quotes);
  }

  // │       "maxChangePercent": 2.729778795967106,
  // │       "year5ChangePercent": 0.6619318181818181,
  // │       "year2ChangePercent": 0.06537477949381199,
  // │       "year1ChangePercent": 0.13402078791692065,
  // │       "ytdChangePercent": -0.03562447611064534,
  // │       "month6ChangePercent": 0.04844760495867284,
  // │       "month3ChangePercent": 0.03901068963337373,
  // │       "month1ChangePercent": -0.02596303090165097,
  // │       "day30ChangePercent": -0.02292993630573259,
  // │       "day5ChangePercent": 0.027997021593447524
  // │       "day200MovingAvg": 47.21,
  // │       "day50MovingAvg": 47.91
  getStats() {
    const symbols: string[] = this.state.symbols;
    console.log("getStats:%o", symbols);
    if(symbols.length === 0) return;
    let filters = ['symbol','maxChangePercent', 'year5ChangePercent', 'year2ChangePercent', 'year1ChangePercent',
      'ytdChangePercent','month6ChangePercent','month3ChangePercent','month1ChangePercent',
      'day30ChangePercent','day5ChangePercent',
      'day50MovingAvg','day200MovingAvg'];
    let url = this.buildStatUrl(symbols, filters);

    fetch(url).then(response => response.json()).then(json => {
      console.log("JSON:%o",json);
      // retire this code
      var qq:any[] = [];
      symbols.forEach(symbol => {
        var data = json[symbol].stat;
        data.symbol = symbol;
        console.log("data:%o", data);
        qq.push(data);
      });
      console.log("qq:%o", qq);
      this.setState({ stats: qq });
    }).catch(error => {
      console.log("error:%o", error);
    });
    console.log("stats:%o", this.state.stats);
  }


  componentDidMount() {
    this.getQuotes();
  }
  componentDidUpdate() {
    //this.getQuotes();
  }


  getComponent(symbol:string) {
    let components:string[] = [];
    this.state.dataMap.forEach((sector:any) =>  { if(symbol === sector.symbol) { components = sector.components; } });
    return components;
  }

  handleChange(symbol:string, event : React.ChangeEvent<HTMLInputElement>) {
    console.log("QL change. symbol:%o event:%o", symbol, event);
    const newSymbols = this.getComponent(symbol); 
    const  level:number = this.state.level;
    console.log("newSymbols:%o", newSymbols);

    switch(level) {
      case 0:
        this.setState({ symbols: newSymbols, level: 1 }, () => {
          console.log("state.symbols  :%o", this.state.symbols);
          this.getQuotes();
        });
        break;
      case 1:
        let url = this.buildFinvizUrl(symbol);
        window.open(url, '_blank');
        break;
      default:
        console.log("Unknown level:%o", level);
    }

    console.log("Exit handleChange");
  }

  render() {
    const qlist = this.state.quotes.map((quote:any) => {
      return <Quote onChange={this.handleChange} key={quote.symbol} symbol={quote.symbol} data={quote} />;
    });

    return (
      <div>
      <Container>
          <Row>Quotes</Row>
          <Row>
            <table className="table table-dark table-bordered">
              <thead>
                <tr >
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Change %</th>
                  <th>5 day Change %</th>
                  <th>30 day Change %</th>
                  <th>3 month Change %</th>
                  <th>50  MA</th>
                  <th>200 MA</th>
                </tr>
              </thead>
              <tbody>
                {qlist}
              </tbody>
            </table>
          </Row>
        </Container>
      </div>
    );
  }
}

export default QuoteList;