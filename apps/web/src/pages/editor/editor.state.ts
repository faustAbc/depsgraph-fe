import { createMachine } from "xstate";

export interface EditorContext {
  test?: string;
}

export const editorMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWE2AxAMIAyAkiQNID6JAggHIBqDAyrewAoMkCiAbQAMAXUSgADqlh5keVADsJIAB6IAjAGZhOAOwAOPQFZhATgPC9e4QDYALPYA0IAJ6atGnGdsAmYxr2xjpavgbGBgC+kS5oGNg4iqgQYAC0ALbJAIaYpGQA8uz8tEz5ACLFALLlDGQi4kgg0rLySirqCNq6hibmltZ2ji7uCAZe9kamA7Y61lExIHFYuEkpGdmYOKiSYIqQeYVCYirNcgrKjR2eBjhatsa21nq+evav9rbDiEFa+oYaGlMDj0tgc0QWqzgKiW2BOMjObUuiFSnzcyNs0Vi6GW+EIYDhLXO7W+vi+oz0OAewns-hBWgMRmemMW2ISkPWEByBIRF1AHQ0ti8pjM9g0vkexjMZmMMrJd1sOF8ZmExj0OnFGj0Zl8zJhK2SaUynM2AGNMDJINzWry1N9PDhhL4NGZ6SqLI8tMYyUF7IrbEZ7NSgtoAbrWfq1kaclsdnsIFaiUiEL5zJTzKLxSYpTKvWiED6-QGgwFPBpwZEgA */
  tsTypes: {} as import("./editor.state.typegen").Typegen0,
  id: "toggle",
  initial: "idle",
  schema: {
    context: {} as EditorContext,
  },
  states: {
    idle: {
      on: {
        CLICK_CANVAS_SPACE: "node-modal",
      },
    },
    "node-modal": {
      initial: "opened",
      on: {
        CLOSE_NODE_MODAL: "idle",
      },
      states: {
        closed: {},
        opened: {
          on: {
            CLOSE: "closed",
          },
        },
      },
    },
  },
});
