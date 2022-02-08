import React, {Component, useEffect} from 'react';
import { Row  } from "react-bootstrap";
//import { Col  } from "react-bootstrap";
import { Container } from "react-bootstrap";


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
  change: number;
  latestPrice: number;
  changePercent: number;
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
        <td>{formatQuote(this.props.latestPrice)}</td>
        <td>{formatChange(this.props.change)}</td>
        <td>{formatChangePercent(this.props.changePercent)}</td>
        </tr>
    );
  }

}

interface QuoteListProps {
  quotes: any;
  stats: any;
  symbols: string[];
  dataMap: any;
}

interface QuoteListState {
  quotes: any;
  stats: any;
  symbols: string[];
  dataMap: any;
}
/* 
 * Main component  for listing quotes
*/
class QuoteList extends Component<QuoteListProps,QuoteListState> {
  constructor(props:QuoteListProps) {
    super(props);
    const symbols = props.dataMap.map((sector:any) => sector.symbol);
    console.log("symbols:%o", symbols);
    console.log("QL props:%o", props);
    console.log("QL symbols:%o", props.symbols);
    console.log("QL dataMap:%o", props.dataMap);

    this.state = {
      quotes: [],
      stats: [],
      dataMap : props.dataMap,
      symbols: symbols || [],
    }
    this.handleChange = this.handleChange.bind(this);
  }

  state:Readonly<QuoteListState> = {
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
    let url = `${baseUrl}/stock/market/batch?symbols=${symbols.join(',')}&types=quote&filter=${filters.join(',')}&token=${API_TOKEN}`;
    console.log("url: %o ", url);
    return url;
  }
 
  // SYMS=XLU,XLC,XLRE
  // curl -k "https://cloud.iexapis.com/stable/stock/market/batch?symbols=$SYMS&types=stats&token=$TOKEN"
  buildStatUrl(symbols:string[]) {
    const API_TOKEN = process.env.REACT_APP_IEX_TOKEN;
    let baseUrl = this.getIEXBaseUrl();
    let url = `${baseUrl}/stock/market/batch?symbols=${symbols.join(',')}&types=stats&token=${API_TOKEN}`;
    console.log("url: %o ", url);
    return url;
  }

  getQuotes() {
    const symbols = this.state.symbols;
    console.log("getQuotes:%o", symbols);
    if(symbols.length === 0) return;
    let filters = ['symbol','latestPrice', 'change', 'changePercent', 'marketCap'];
    let url = this.buildIEXUrl(symbols, filters);

    fetch(url).then(response => response.json()).then(json => {
      console.log("JSON:%o",json);
      // retire this code
      var qq:any[] = [];
      symbols.forEach((symbol:string) => {
        var data = json[symbol].quote;
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
  getStats() {
    const symbols = this.state.symbols;
    console.log("getStats:%o", symbols);
    if(symbols.length === 0) return;
    let filters = ['symbol','latestPrice', 'change', 'changePercent', 'marketCap'];
    let url = this.buildIEXUrl(symbols, filters);

    fetch(url).then(response => response.json()).then(json => {
      console.log("JSON:%o",json);
      // retire this code
      var qq:any[] = [];
      symbols.forEach(symbol => {
        var data = json[symbol].quote;
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
    console.log("newSymbols:%o", newSymbols);

    //this.setState({ symbols: newSymbols }); 
    this.setState({ symbols: newSymbols }, () => {
      console.log("state.symbols  :%o", this.state.symbols);
      this.getQuotes();
    });
    //this.forceUpdate();
    console.log("Exit handleChange");
  }

  render() {
      //return <Quote key={quote.symbol} {...quote} />;
    const qlist = this.state.quotes.map((quote:any) => {
      return <Quote onChange={this.handleChange} key={quote.symbol} symbol={quote.symbol} latestPrice={quote.latestPrice} change={quote.change}  changePercent={quote.changePercent}/>;
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