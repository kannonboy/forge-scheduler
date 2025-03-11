import { onInstall } from "./scheduler";
import { scheduleTasks } from "./taskQueue";
import { taskProcessor } from "./processor";
import { updateInterval } from "./scheduler";

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
