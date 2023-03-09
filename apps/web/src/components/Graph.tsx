import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getData } from "../mocks/graph";
import { ForceGraphProps, GraphData, NodeObject } from "react-force-graph-2d";

export interface Node {
  id: number;
  neighbors: Node[];
  links: Link[];
}

export interface Link {
  target: number;
  source: number;
}

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

const NODE_R = 8;

const rawData = {
  links: [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
  ],
  nodes: [
    { id: 0, name: "test" },
    { id: 1, name: "test 2" },
    { id: 2, name: "test 2" },
    { id: 3, name: "test 2" },
  ],
} satisfies GraphData;

const data = getData(rawData);

export const Graph = () => {
  const [highlightNodes, setHighlightNodes] = useState(new Set<NodeObject>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<NodeObject>());
  const [hoverNode, setHoverNode] = useState<NodeObject | null>(null);

  const paintRing = useCallback<Required<ForceGraphProps>["nodeCanvasObject"]>(
    (node, ctx, globalScale) => {
      // add ring just for highlighted nodes
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
      ctx.fillStyle = node === hoverNode ? "#0020f060" : "#0020f020";
      ctx.fill();
      ctx.closePath();

      console.log(node);

      // const label = node.label;
      // const fontSize = 12 / globalScale;
      // ctx.font = `${fontSize}px Sans-Serif`;
      // const textWidth = ctx.measureText(label).width;
      // // const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

      // // ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      // // ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

      // ctx.textAlign = "center";
      // ctx.textBaseline = "middle";
      // ctx.fillStyle = "black";
      // ctx.fillText(label, node.x, node.y);

      // node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
    },
    [hoverNode]
  );

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = (
    node: NodeObject | null,
    previousNode: NodeObject | null
  ) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors?.forEach((neighbor) => highlightNodes.add(neighbor));
      node.links?.forEach((link) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = (link: Link) => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  return (
    <ForceGraph2D
      graphData={data}
      nodeRelSize={NODE_R}
      autoPauseRedraw={false}
      linkWidth={(link) => (highlightLinks.has(link) ? 5 : 1)}
      linkDirectionalParticles={4}
      // linkDirectionalParticleWidth={(link) =>
      //   highlightLinks.has(link) ? 4 : 0
      // }
      nodeLabel={"name"}
      linkDirectionalParticleWidth={0}
      nodeCanvasObject={paintRing}
      onNodeHover={handleNodeHover}
      onLinkHover={handleLinkHover}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      nodeCanvasObjectMode={(node) =>
        highlightNodes.has(node) ? "before" : undefined
      }
    />
  );
};
