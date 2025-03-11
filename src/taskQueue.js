import { Queue } from '@forge/events';
import { storage } from '@forge/api';
import Resolver from "@forge/resolver";

import { runTaskForSchedule } from "./scheduler";

const taskQueue = new Queue({ key: 'tasks' });

const TEN_MINUTES = 10 * 60;

/**
 * This function is bound to a scheduled trigger that runs every 5 minutes. It iterates through 
 * all registered schedules and schedules any tasks due in the next 10 minutes. We schedule the 
 * next 10 minutes to allow for any variability in the scheduled trigger execution timing.
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

    // if the task has never run, schedule it immediately
    if (schedule.lastScheduledFor === 0) {
      await scheduleTask(key, 0);
      lastScheduledFor = now;
    }

    // schedule any tasks due to run in the next 10 minutes
    while (lastScheduledFor + schedule.interval < now + TEN_MINUTES) {
      const scheduleDueAt = scheduleDueAt + schedule.interval;
            
      // delay the task so that it runs at the correct time
      let delay = scheduleDueAt - now;
      
      if (delay < 0) {        
        // if the calculated delay is negative, the task is overdue. This implies the 
        // scheduled trigger did not fire for more than 10 minutes, which may happen 
        // if the trigger is disabled or there is an incident impacting the Forge 
        // platform. In this case, we run the task immediately. This resets the 
        // "lastScheduledFor" timestamp to the current time, so if multiple tasks 
        // on the same schedule were overdue, it will only run the task once.
        console.warn(`Task ${key} is overdue by ${-delay} seconds`); 
        delay = 0;
      }

      await scheduleTask(key, delay);
      lastScheduledFor = now + delay;
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
  console.log(`Scheduling task ${key} to run in ${delayInSeconds} seconds`);
  return taskQueue.push({ key }, { delayInSeconds });
}

const resolver = new Resolver();

/**
 * Consume a task from the queue and execute it.
 */
resolver.define("process-task", async ({ payload: { key }, context }) => {
  console.log(`Running task ${key}`);
  await runTaskForSchedule(key);
});

export const taskProcessor = resolver.getDefinitions();
