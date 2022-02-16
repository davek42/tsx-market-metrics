// global types file

declare module "*.json" {
    const value: any;
    export default value;
}

interface SectorData {
    symbol: string;
    components: string[];
}

interface QuoteListProps {
    quotes: any;
    stats: any;
    symbols: string[];
    dataMap: SectorData[];
}
  
interface QuoteListState {
    level: number;
    quotes: any;
    stats: any;
    symbols: string[];
    dataMap: SectorData[];
}

export { QuoteListProps, QuoteListState, SectorData };