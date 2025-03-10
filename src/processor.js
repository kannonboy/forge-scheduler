import Resolver from "@forge/resolver";
import { runTask } from "./tasks";

const resolver = new Resolver();

resolver.define("process-task", async ({ payload: { scheduleKey }, context }) => {
  console.log(`Running task ${scheduleKey}`);
  await runTask(scheduleKey);
});

export const taskProcessor = resolver.getDefinitions();
