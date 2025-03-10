import { storage } from "@forge/api";
import { LOG_EVERY_MINUTE, LOG_EVERY_20_MINUTES } from "./processor";

const MINUTES = 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const WEEKS = DAYS * 7;

export async function onInstall(event, context) {
  await addSchedule(LOG_EVERY_MINUTE, 1 * MINUTES);
  await addSchedule(LOG_EVERY_20_MINUTES, 20 * MINUTES);
}

/**
 * @param {*} scheduleKey an identifier for the schedule (used to distinguish between different schedules in `processor.js`)
 * @param {*} interval interval (in seconds)
 */
async function addSchedule(scheduleKey, interval) {
  console.log(`Adding schedule for ${scheduleKey} with interval ${interval} seconds`);
  return storage.entity("schedule").set(scheduleKey, { interval, lastScheduledFor: 0 });
}