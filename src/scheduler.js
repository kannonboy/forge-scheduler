import { storage } from '@forge/api';

import { scheduleTasks } from './taskQueue';

import logRandomProject from './tasks/randomProject';
import counter from './tasks/counter';

const MINUTES = 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const WEEKS = DAYS * 7;

class Schedule {  
  constructor(key, interval, runTask) {
    this.key = key;
    this.interval = interval;
    this.runTask = runTask;
  }
}

const schedules = [
  new Schedule('log-random-project', 20 * MINUTES, logRandomProject),
  new Schedule('incrementing-counter', 1 * MINUTES, counter),
];

export async function onInstall() {  
  console.log(`App installed! Initialising ${schedules.length} schedules...`);
  for (const schedule of schedules) {
    console.log(`Schedule ${schedule.key} will run every ${schedule.interval} seconds`);
    await storage.entity("schedule").set(schedule.key, {
      interval: schedule.interval, 
      lastScheduledFor: 0
    });
  }

  // schedule tasks immediately after install
  await scheduleTasks();
}

export async function updateInterval(key, newInterval) {
  const schedule = await storage.entity("schedule").get(key);

  if (!schedule) {
    console.error(`Schedule ${key} not found`);
    return;
  }
  console.log(`Updating schedule ${key} to every ${newInterval} seconds`);
  
  const now = Math.floor(Date.now() / 1000);
  if (schedule.lastScheduledFor > now) {
    console.warn(`Schedule ${key} had tasks enqueued for the next ten minutes. These will still execute.`);
  }

  await storage.entity("schedule").set(key, { 
    interval: newInterval, 
    lastScheduledFor: 0 // reset the schedule to enqueue tasks using the new schedule immediately
  });

  // schedule tasks after update
  await scheduleTasks();
}

export async function runTaskForSchedule(key) {
  const schedule = schedules.find(schedule => schedule.key === key);
  return schedule.runTask();
}
