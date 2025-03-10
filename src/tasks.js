
import { storage } from '@forge/api';
import logRandomProject from './tasks/randomProject';
import counter from './tasks/counter';

const MINUTES = 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const WEEKS = DAYS * 7;

class Task {  
  constructor(scheduleKey, interval, runTask) {
    this.scheduleKey = scheduleKey;
    this.interval = interval;
    this.runTask = runTask;
  }
}

const tasks = [
  new Task('log-random-project', 20 * MINUTES, logRandomProject),
  new Task('incrementing-counter', 1 * MINUTES, counter),
];

export async function registerTasks() {
  for (const task of tasks) {
    await storage.entity("schedule").set(task.scheduleKey, { 
      interval: task.interval, 
      lastScheduledFor: 0 
    });
  }
}

export async function updateInterval(scheduleKey, newInterval) {
  const schedule = storage.entity("schedule").get(scheduleKey);
  await storage.entity("schedule").set(scheduleKey, { 
    interval: newInterval, 
    lastScheduledFor: schedule.lastScheduledFor 
  });
}

export async function runTask(scheduleKey) {
  const task = tasks.find(task => task.scheduleKey === scheduleKey);
  return task.runTask();
}
