import { Button } from "ui";
import { useMachine } from "@xstate/react";
import { editorMachine } from "./editor.state";
import { NodeModal } from "./ModeModal";
import { ForceGraph } from "../../components/ForceGraph";

export default function Web() {
  const [state, send] = useMachine(editorMachine);
  console.log(state.value);

  return (
    <div>
      <Button onClick={() => send("CLICK_CANVAS_SPACE")}>Create node</Button>
      <ForceGraph />
      <NodeModal
        open={state.matches("node-modal")}
        close={() => send("CLOSE")}
      />
    </div>
  );
}
