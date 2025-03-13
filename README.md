# Forge Scheduler example app

This is an example Atlassian Forge app demonstrating how to run tasks on an arbitrary recurring schedule. 

Forge has a built in [Scheduled trigger](https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/) feature that is simpler to use, but is limited to invoking functions on a fixed five minute, hourly, daily, or weekly schedule.

This example app implements a more flexible pattern that allows you to:

- run a periodic task every X seconds (from every 10 seconds to biweekly, monthly, or longer)
- allows updating of a schedule at runtime
- support up to 100 different schedules

## Getting Started

- Clone this repository.

- Register a copy of the app to your Atlassian account:
```
forge register
```

- Install top-level dependencies:
```
npm install
```

- Deploy your app:
```
forge deploy
```

- Install your app into an Atlassian site:
```
forge install
```

## Defining schedules

Scheduled tasks are defined in the `schedules` array in `scheduler.js`:

```
const schedules = [
  new Schedule({
    key: 'log-random-project', 
    interval: 20 * MINUTES, 
    runTask: logRandomProject
  }), 
  new Schedule ({
    key: 'incrementing-counter', 
    interval: 1 * MINUTES, 
    runTask: counter
  }),
];
```

Each schedule has: 

- a `key`, used to identify the scheule in logs and in Forge storage; 
- an `interval`, how often (in seconds) the schedule should run; and
- a `runTask` function, which is invoked at the specified interval

There are two example tasks included in the `/tasks` subdirectory.

To add your own tasks, simply add new `Schedule` instances to the array.

## Updating schedule intervals

Schedule intervals can be updated using the `updateInterval` function exported by `scheduler.js`.

## Architecture

The Forge Scheduler uses a combination of a 5 minute [scheduled trigger](https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/) and [async events](https://developer.atlassian.com/platform/forge/runtime-reference/async-events-api/) to implement fine-grained 
scheduling. 

The scheduled trigger runs every five minutes, and checks each schedule to see whether it should run in the next ten minutes. It then registers 
any upcoming tasks as an async event on the `tasks` queue, passing the offset of the scheduled time from the current time as a `delayInSeconds` option 
on the event. The time of the latest task for each schedule is then stored to avoid the same task being scheduled multiple times when the scheduled 
trigger next runs. Though the scheduled trigger runs every five minutes, it schedules any tasks due in the next ten minutes to avoid missing events 
if there is any variation in the timing of the scheduled trigger being invoked by the Forge platform. See `scheduleTasks()` in `taskQueue.js` for further 
details.

Schedules are stored as [custom entities](https://developer.atlassian.com/platform/forge/storage-reference/storage-api-custom-entities/), which are 
initialised during app installation using a trigger bound to the `avi:forge:installed:app` event (`onInstal()` in `scheduler.js`).

## Logging

Being an example app, logging is (very) verbose to help you understand its behaviour. You may wish to tune or disable the logging for use in production.

## Debugging

A debug webtrigger is provided for interactively registering, running, and updating schedules. See `debug.js` for details.

## Requirements

- Requires Node v20+ (tested on v20.18.1)

## License

Copyright (c) 2025 Atlassian and others.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.
[![From Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers.png)](https://www.atlassian.com)
