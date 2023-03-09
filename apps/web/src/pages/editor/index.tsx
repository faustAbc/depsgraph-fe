import { Button } from "ui";
import { Graph } from "../../components/Graph";
import { useMachine } from "@xstate/react";
import { editorMachine } from "./editor.state";

export default function Web() {
  const [state, send] = useMachine(editorMachine);

  return (
    <div>
      <h1>Web</h1>
      <Button />
      <Graph />
    </div>
  );
}
