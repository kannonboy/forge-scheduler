# Forge Scheduler example app

This is an example Atlassian Forge app demonstrating how to run tasks on an arbitrary recurring schedule. 

Forge has a built in [Scheduled trigger](https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/) feature that is simpler to use, but is limited to invoking functions on a fixed five minute, hourly, daily, or weekly schedule.

This example app implements a more flexible pattern that allows you to:

- run a periodic task every X seconds (from every 5 seconds to biweekly, monthly, or longer)
- allows updating of a schedule at runtime
- support up to 100 different schedules

## Defining tasks



## Requirements

- Requires Node v20+ (tested on v20.18.1)

## Usage


## License
Copyright (c) 2025 Atlassian and others.
Apache 2.0 licensed, see [LICENSE](LICENSE) file.
[![From Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers.png)](https://www.atlassian.com)

