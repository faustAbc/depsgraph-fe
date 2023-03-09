import { createMachine } from "xstate";

export const editorMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcD2UoBswDoCWE2AxAMIAyAkiQNID6JAggHIBqDAyrewAoMkCiAbQAMAXUSgADqlh5keVADsJIAB6IAjAGZhOAOwAOPQFZhATgPC9e4QDYALPYA0IAJ6atGnGdsAmYxr2xjpavgbGBgC+kS5oGNg4iqgQYAC0ALbJAIaYpGQA8uz8tEz5ACLFALLlDGQi4kgg0rLySirqCNq6hibmltZ2ji7uCAZe9kamA7Y61lExIHFYuEkpGdmYOKiSYIqQeYVCYirNcgrKjR2+wsY44X62pgH2hmbObogvWt7+wr5mdjsxj0vmiC1WcBUS2wJxkZzal0QqVswyRtmisXQy3whDAsJa53an18qNGehwxlswns-j0MwMRhBGMWWISEPWEBy+PhF1AHXsZlJWgMthw9i0Jl82mM4oF9mZ0JWyTSmU5mwAxpgZJBua1eWpEJ4DBSNP5-MLhXoNAYtKSXvYxRpKTLHBo-hozArWUq1qqclsdnsILrCYiEGY9Ha9A77E7Ho5Y+7PWCgA */
  id: "toggle",
  initial: "idle",
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
