import { storage } from '@forge/api';

import { scheduleTasks } from './taskQueue';

import logRandomProject from './tasks/randomProject';
import counter from './tasks/counter';

// handy constants for scheduling periods
const MINUTES = 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const WEEKS = DAYS * 7;

/**
 * A class representing a schedule. A schedule has the following properties:
 * - `key` is a unique identifier for the schedule, used to identify the schedule in Forge storage and logs
 * - `interval` is the default time in seconds between each run of the task
 * - `runTask` is the function to run when the schedule triggers
 */
class Schedule {
  constructor({ key, interval, runTask }) {
    this.key = key;
    this.interval = interval;
    this.runTask = runTask;
  }
}

/**
 * An array of (up to 100) schedules to initialise. The interval can be updated at 
 * runtime using `updateInterval`.
 * 
 * There are two example schedules: 
 *  - `log-random-project` - logs a Jira random project every 20 minutes
 *  - `incrementing-counter` - logs an incrementing counter every minute
 */
const schedules = [
  new Schedule({
    key: 'log-random-project', 
    interval: 20 * MINUTES, 
    runTask: logRandomProject
  }), new Schedule ({
    key: 'incrementing-counter', 
    interval: 1 * MINUTES, 
    runTask: counter
  }),
];

/**
 * This function is bound to the `installed` lifecycle event. It initialises the schedules in Forge
 * storage and schedules the tasks for the first time.
 */
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

/**
 * Update the interval of a schedule. This will trigger the schedule to run immediately. 
 * 
 * Note: Any pending task executions registered to run in the next 5-10 minutes will 
 * still execute using the old interval (this will only occur if the previous interval 
 * was < 10 minutes).
 * 
 * @param {string} key the key of the schedule to update
 * @param {string} newInterval the new interval in seconds for the schedule (must be >= 5)
 */
export async function updateInterval(key, newInterval) {
  const schedule = await storage.entity("schedule").get(key);

  if (!schedule) {
    console.error(`Schedule ${key} not found - can't update interval`);
    return;
  }

  if (newInterval < 5) {
    console.error(`New interval ${newInterval} for schedule ${key} is too short - must be at least 5 seconds`);
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

  // re-schedule tasks immediately after update
  await scheduleTasks();
}

/**
 * Invokes the `runTask` function for a given schedule.
 * 
 * @param {*} key the key of the schedule to run the task for
 */
export async function runTaskForSchedule(key) {
  const schedule = schedules.find(schedule => schedule.key === key);
  if (!schedule) {
    console.error(`Schedule ${key} not found - can't execute task`);
    return;
  }
  return schedule.runTask();
}
