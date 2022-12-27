type Ungrouped = {
  code: string;
  method: string;
  _type: string;
};

export type Instruments = {
  code: string;
  id: string;
  method: string;
  _type: string;
  _ungrouped: Ungrouped[];
  blockTitle?: string;
  section?: string;
};

export type Block = {
  code: string;
  _type: string;
  instruments: Instruments[];
};
