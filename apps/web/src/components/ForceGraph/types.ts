export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface Node {
  id: string;
  group: number;
}

export interface Link {
  source: string;
  target: string;
  value: number;
}
