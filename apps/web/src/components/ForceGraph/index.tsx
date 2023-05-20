import React, { useEffect, useRef } from "react";
import { forceGraphGenerator } from "./forceGraphGenerator";
import miserables from "../../mocks/miserables.json";

export const ForceGraph = ({}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapperNode = wrapperRef.current;
    const { clear, element } = forceGraphGenerator(miserables, {
      nodeId: (d) => d.id,
      nodeGroup: (d) => d.group,
      nodeTitle: (d) => `${d.id}\n${d.group}`,
      linkStrokeWidth: (l) => Math.sqrt(l.value),
      width: 800,
      height: 800,
      // nodeStrength: -100,
      nodeRadius: () => Math.random() * 10 + 4,
      // linkStrength: 0.1,
    });

    wrapperNode?.append(element);

    return clear;
  }, []);

  return <div ref={wrapperRef} />;
};
