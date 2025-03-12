import { storage } from "@forge/api";

/**
 * Example task that increments a counter in Forge storage and logs the number of times it has run.
 */
export default async function counter() {
  let counter = (await storage.get('counter')) || 0;
  counter++;
  console.log(`Counter schedule has run ${counter} times`);
  await storage.set('counter', counter);
}