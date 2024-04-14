interface Showing {
  id: number;
  datetime: string;
  location: string;
  price: string;
}

interface Theme {
  id: number,
  name: string
}

interface ProgramData {
  id: number;
  department: string;
  title: string;
  description: string;
  link: string;
  showings: Showing[];
  themes: Theme[];
  image_filename: String | null;
}

interface ProgramFormShowing {
  datetime: string,
  location: string,
  price: string
}

interface ProgramForm {
  title: string,
  department: string,
  description: string,
  link: string,
  showings: ProgramFormShowing[],
  image: File | undefined,
}

export type {
  Showing,
  ProgramData,
  ProgramFormShowing,
  ProgramForm,
  Theme
}