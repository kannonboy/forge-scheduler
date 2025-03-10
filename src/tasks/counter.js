import { storage } from "@forge/api";

export default async function counter() {
  let counter = storage.get('counter') || 0;
  counter++;
  console.log(`Counter task has run ${counter} times`);
  storage.set('counter', counter);
}