import { Queue } from '@forge/events';
import { storage } from '@forge/api';
import Resolver from "@forge/resolver";

import { runTaskForSchedule } from "./scheduler";

const taskQueue = new Queue({ key: 'tasks' });

const TEN_MINUTES = 10 * 60;

/**
 * Iterates through registered schedules and schedules any tasks due in the next ten minutes.
 * 
 * Ten minutes is chosen as this function is called by scheduled trigger every five minutes, and 
 * the max `delayInSeconds` for a queue is 15 minutes. 
 */
export async function scheduleTasks() {
  const query = await storage
    .entity("schedule")
    .query()
    .index("by-key")
    .limit(100) // note - processes at most 100 schedules
    .getMany();

  console.log(`Found ${query.results.length} schedules to process`);

  const now = Math.floor(Date.now() / 1000);

  for (const result of query.results) {
    const { key, value: schedule } = result;
    let lastScheduledFor = schedule.lastScheduledFor;

    // If the task has never run, schedule it immediately
    if (schedule.lastScheduledFor === 0) {
      await scheduleTask(key, 0);
      lastScheduledFor = now;
    }

    // Schedule any tasks that are due in the next ten minutes
    while (lastScheduledFor + schedule.interval < now + TEN_MINUTES) {
      lastScheduledFor += schedule.interval;
      await scheduleTask(key, lastScheduledFor - now);
    }
    
    // Store the time of the last scheduled task
    if (lastScheduledFor !== schedule.lastScheduledFor) {
      console.log(`Updating lastScheduledFor to ${lastScheduledFor} for ${key}`);
      await storage.entity("schedule").set(key, {
        interval: schedule.interval,
        lastScheduledFor,
      });
    }
  }
}

/**
 * Pushes a task on the task queue.
 */
async function scheduleTask(key, delayInSeconds) {
  if (delayInSeconds < 0) {
    // this should only happen if the scheduled trigger did not trigger for 10+ minutes
    console.warn(`Task ${key} is overdue by ${-delayInSeconds} seconds`); 
    delayInSeconds = 0;
  }
  console.log(`Scheduling task ${key} to run in ${delayInSeconds} seconds`);
  return taskQueue.push({ key }, { delayInSeconds });
}

const resolver = new Resolver();

/**
 * Consume a task from the task and executes it.
 */
resolver.define("process-task", async ({ payload: { key }, context }) => {
  console.log(`Running task ${key}`);
  await runTaskForSchedule(key);
});

export const taskProcessor = resolver.getDefinitions();
