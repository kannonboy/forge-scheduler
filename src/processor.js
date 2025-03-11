import Resolver from "@forge/resolver";
import { runTaskForSchedule } from "./scheduler";

const resolver = new Resolver();

resolver.define("process-task", async ({ payload: { key }, context }) => {
  console.log(`Running task ${key}`);
  await runTaskForSchedule(key);
});

export const taskProcessor = resolver.getDefinitions();
