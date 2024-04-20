interface SearchQuery {
  title?: string;
  departments?: string;
  themes?: string[];
  dates?: string[];
  searchByRange?: boolean;
  searchByCourse?: boolean;
}

export type {
  SearchQuery
}