import { GraphData } from "react-force-graph-2d";
import { Link, Node } from "../components/Graph";

export function genRawGraphData(N = 300, reverse = false): GraphData {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })) as Node[],
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map<Link>((id) =>
        reverse
          ? {
              ["target"]: id,
              ["source"]: Math.round(Math.random() * (id - 1)),
            }
          : {
              ["source"]: id,
              ["target"]: Math.round(Math.random() * (id - 1)),
            }
      ),
  };
}

export const getData = (rawGraphData: GraphData) => {
  if (typeof window === "undefined") return rawGraphData;
  const clonedRawGraphData = structuredClone(rawGraphData);
  // cross-link node objects
  clonedRawGraphData.links.forEach((link) => {
    const a = clonedRawGraphData.nodes[link.source];
    const b = clonedRawGraphData.nodes[link.target];
    !a.neighbors && (a.neighbors = []);
    !b.neighbors && (b.neighbors = []);
    a.neighbors.push(b);
    b.neighbors.push(a);

    !a.links && (a.links = []);
    !b.links && (b.links = []);
    a.links.push(link);
    b.links.push(link);
  });

  return clonedRawGraphData;
};
