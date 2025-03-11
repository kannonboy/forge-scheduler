import { onInstall } from "./scheduler";
import { scheduleTasks } from "./taskQueue";
import { taskProcessor } from "./processor";

export async function debugWebtrigger(request) {
  console.log("Received request", request);
  const fn = request.queryParameters.fn?.[0];
  console.log(`Running function: ${fn}`);

  try {
    switch (fn) {
      case "onInstall":
        await onInstall();
        console.log("onInstall completed");
        break;
      case "scheduleTasks":
        await scheduleTasks();
        console.log("scheduleTasks completed");
        break;
      case "taskProcessor":
        await taskProcessor();
        console.log("taskProcessor completed");
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
