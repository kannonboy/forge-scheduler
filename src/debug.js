import { onInstall } from "./scheduler";
import { scheduleTasks, taskProcessor } from "./taskQueue";
import { updateInterval } from "./scheduler";

/**
 * This is a debug webtrigger that allows you to test deployed functions and update schedules.
 * Uncomment the `webtrigger` section of `manifest.yml` to enable it.
 * 
 * Available query parameters are:
 * - `fn`: the function to run — see switch below for available functions
 * - `key`: (for `updateSchedule`) the key of the schedule to update
 * - `interval`: (for `updateSchedule`) the new interval for the schedule
 */
export async function debugWebtrigger(request) {
  console.log("Received request", request);
  const fn = request.queryParameters.fn?.[0];
  console.log(`Running function: ${fn}`);

  try {
    switch (fn) {
      case "onInstall":
        await onInstall();
        break;
      case "scheduleTasks":
        await scheduleTasks();
        break;
      case "taskProcessor":
        await taskProcessor();
        break;
      case "updateSchedule":
        const key = request.queryParameters.key?.[0];
        const interval = parseInt(request.queryParameters.interval?.[0]);
        await updateInterval(key, interval);
        break;
      default:
        return {
          statusCode: 400,
          body: `Unknown function: ${fn}`,
        }
    }
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: `Error running function: ${fn}`
    }
  }
  
  return {
    statusCode: 200,
    body: `Executed function: ${fn}`
  };
}
