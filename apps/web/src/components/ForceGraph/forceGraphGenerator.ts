import * as d3 from "d3";
import { GraphData } from "./types";
import { Node } from "./types";
import { Link } from "./types";

type NodeMapper = Parameters<typeof d3.map<Node, any>>[1];
type LinkMapper = Parameters<typeof d3.map<Link, any>>[1];

interface ForceGraphGeneratorProps {
  nodeId?: NodeMapper;
  nodeGroup?: NodeMapper;
  nodeGroups?: Iterable<{ toString(): string }>;
  nodeTitle?: NodeMapper;
  nodeFill?: string;
  nodeStroke?: string;
  nodeStrokeWidth?: Parameters<
    d3.Selection<SVGGElement, undefined, null, unknown>["attr"]
  >[1];
  nodeStrokeOpacity?: number;
  nodeRadius?: number;
  nodeStrength?: Parameters<
    d3.ForceManyBody<d3.SimulationNodeDatum>["strength"]
  >[0];
  linkSource?: LinkMapper;
  linkTarget?: LinkMapper;
  linkStroke?: string;
  linkStrokeOpacity?: number;
  linkStrokeWidth?: Parameters<d3.Selection<any, any, any, any>["attr"]>[1];
  linkStrokeLinecap?: string;
  linkStrength?: number;
  colors?: readonly string[];
  width: number;
  height: number;
}

export const forceGraphGenerator = (
  {
    nodes, // an iterable of node objects (typically [{id}, …])
    links, // an iterable of link objects (typically [{source, target}, …])
  }: GraphData,
  {
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width, // outer width, in pixels
    height, // outer height, in pixels
  }: ForceGraphGeneratorProps
) => {
  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const W =
    typeof linkStrokeWidth !== "function"
      ? null
      : d3.map(links, linkStrokeWidth as any);
  const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

  // Replace the input nodes and links with mutable objects for the simulation.
  const mappedNodes = d3.map(
    nodes,
    (_, i) =>
      ({
        id: N[i],
      } as d3.SimulationNodeDatum)
  );
  const mappedLinks = d3.map(links, (_, i) => ({
    source: LS[i],
    target: LT[i],
  }));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody().distanceMin(0.1);
  const forceLink = d3
    .forceLink(mappedLinks)
    .id(({ index: i }) => N[i as number]);

  if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
  if (linkStrength !== undefined) forceLink.strength(linkStrength);

  const simulation = d3
    .forceSimulation(mappedNodes)
    .alphaMin(0.1)
    .alphaTarget(0.1)
    .velocityDecay(0.9) // low friction
    .force("x", d3.forceX().strength(0.1))
    .force("y", d3.forceY().strength(0.1))

    .force("link", forceLink)
    .force("manyBody", forceNode)
    .force("center", d3.forceCenter().strength(1))
    .force("collide", d3.forceCollide(50).iterations(1).strength(0.1))
    .on("tick", ticked);

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const link = svg
    .append("g")
    .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
    .attr("stroke-opacity", linkStrokeOpacity)
    .attr(
      "stroke-width",
      typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null
    )
    .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(mappedLinks)
    .join("line");

  const node = svg
    .append("g")
    .attr("fill", nodeFill)
    .attr("stroke", nodeStroke)
    .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(mappedNodes)
    .join("circle")
    .attr("r", nodeRadius)
    .call(drag(simulation));

  if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
  if (L) link.attr("stroke", ({ index: i }) => L[i]);
  if (G) node.attr("fill", ({ index: i }) => color(G[i]));
  if (T) node.append("title").text(({ index: i }) => T[i]);

  function intern(value) {
    return value !== null && typeof value === "object"
      ? value.valueOf()
      : value;
  }

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x as number).attr("cy", (d) => d.y as number);
  }

  function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
    function dragstarted(event: any) {
      // if (!event.active) simulation.alpha(10).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      // if (!event.active) simulation.alpha(1).restart();

      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  const clear = () => {
    simulation.stop();
    svg.remove();
  };

  const element = Object.assign(svg.node() as SVGSVGElement, {
    scales: { color },
  });

  return { clear, element };
};
