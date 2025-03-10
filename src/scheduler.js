
import { Queue } from '@forge/events';

const taskQueue = new Queue({ key: 'tasks' });

export async function scheduleTasks() {
  const query = await storage
    .entity("schedule")
    .query()
    .limit(100) // note - processes at most 100 schedules
    .getMany();

  for (const schedule of query.results) {
    console.log(schedule);
    //   if (schedule.lastScheduledFor + schedule.interval < Date.now()) {
    //     await taskQueue.push({ scheduleKey: schedule.key });

    //     await storage.entity("schedule").set(schedule.key, {
    //       interval: schedule.interval,
    //       lastScheduledFor: Date.now(),
    //     });
    //   }
    // }
  }
}
