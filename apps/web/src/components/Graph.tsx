import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getData } from "../mocks/graph";
import {
  ForceGraphMethods,
  ForceGraphProps,
  GraphData,
  NodeObject,
} from "react-force-graph-2d";
import { montserrat } from "../../pages/_app";
import tinycolor from "tinycolor2";

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
    { source: 0, name: "test - 123", target: 1 },
    { source: 0, name: "test - 123", target: 2 },
    { source: 3, name: "test - 123", target: 4 },
    { source: 0, name: "test - 123", target: 3 },
    { source: 4, name: "test - 123", target: 5 },
  ],
  nodes: [
    { id: 0, val: 3, color: "lightblue", text: "hello there", name: "test" },
    {
      id: 1,
      val: 1,
      color: "lightblue",
      text: "some long texxxt",
      name: "test 2",
    },
    { id: 2, val: 1, color: "lightblue", name: "test 2", text: "some text" },
    { id: 3, val: 1, color: "lightgrey", name: "test 2", text: "some text" },
    { id: 4, val: 1, color: "lightgrey", name: "test 2", text: "some text" },
    { id: 5, val: 1, color: "blue", name: "test 2", text: "some text" },
  ],
} satisfies GraphData;

const data = getData(rawData);

export const Graph = () => {
  const [highlightNodes, setHighlightNodes] = useState(new Set<NodeObject>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<NodeObject>());
  const [hoverNode, setHoverNode] = useState<NodeObject | null>(null);
  const ref = useRef<ForceGraphMethods>();

  const paintRing = useCallback<Required<ForceGraphProps>["nodeCanvasObject"]>(
    (node, ctx, globalScale) => {
      // add ring just for highlighted nodes
      ctx.beginPath();
      /** Copied from source
       * https://github.com/vasturiano/force-graph/blob/master/src/force-graph.js#L294
       */
      const realR = Math.sqrt(Math.max(0, node.val || 1)) * NODE_R;

      ctx.arc(node.x, node.y, realR * 1.3, 0, 2 * Math.PI, false);

      const isHovered = hoverNode !== null && node === hoverNode;
      const isHoverNeighbor = hoverNode !== null && highlightNodes.has(node);
      const isSemiHidden = hoverNode !== null && !isHovered && !isHoverNeighbor;
      const isDefault = hoverNode === null;

      const [, newBackground] = [
        [isHovered, tinycolor(node.color).darken(30)],
        [isHoverNeighbor, tinycolor(node.color).darken(20)],
        [isSemiHidden, tinycolor("lightgrey").brighten(15)],
        [isDefault, node.color],
      ].find(([cond]) => cond);

      ctx.fillStyle = newBackground;

      // if (node === hoverNode) {
      //   ctx.fillStyle = tinycolor(node.color).darken(20);
      // } else if (hoverNode !== null) {
      //   ctx.fillStyle = tinycolor("lightgrey").brighten(15);
      // }

      ctx.fill();
      ctx.closePath();

      const label = node.text;
      if (typeof label === "undefined") return;
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px ${montserrat.style.fontFamily}`;
      console.log(ctx.font);

      const textWidth = ctx.measureText(label).width;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = [
        [isDefault || isHovered || isHoverNeighbor, "black"],
        [true, tinycolor("lightgrey")],
      ]
        .find(([cond]) => cond)
        ?.at(1);
      ctx.fillText(label, node.x, node.y);

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
      ref={ref}
      graphData={data}
      nodeRelSize={NODE_R}
      autoPauseRedraw={true}
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
      linkDirectionalArrowLength={6}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.25}
      nodeAutoColorBy={(d) => d.group}
      // nodeCanvasObjectMode={(node) =>
      //   highlightNodes.has(node) ? "after" : undefined
      // }
    />
  );
};
