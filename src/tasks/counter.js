import { storage } from "@forge/api";

export default async function counter() {
  let counter = (await storage.get('counter')) || 0;
  counter++;
  console.log(`Counter task has run ${counter} times`);
  await storage.set('counter', counter);
}