interface SearchQuery {
  title?: string;
  departments?: string[];
  themes?: string[];
  dates?: string[];
  searchByRange?: boolean;
}

export type {
  SearchQuery
}