import { Queue } from '@forge/events';
import { storage } from '@forge/api';

const taskQueue = new Queue({ key: 'tasks' });

const TEN_MINUTES = 10 * 60;

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
    
    // Store the last scheduled time
    if (lastScheduledFor !== schedule.lastScheduledFor) {
      console.log(`Updating lastScheduledFor to ${lastScheduledFor} for ${key}`);
      await storage.entity("schedule").set(key, {
        interval: schedule.interval,
        lastScheduledFor,
      });
    }
  }
}

async function scheduleTask(key, delayInSeconds) {
  console.log(`Scheduling task ${key} to run in ${delayInSeconds} seconds`);
  return taskQueue.push({ key }, { delayInSeconds });
}
