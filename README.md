# On-Demand Monitoring of Unix-Based Servers - Log Retrieval via REST

- [On-Demand Monitoring of Unix-Based Servers - Log Retrieval via REST](#on-demand-monitoring-of-unix-based-servers---log-retrieval-via-rest)
  - [Introduction](#introduction)
  - [Design](#design)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Documentation](#documentation)
  - [Utils](#utils)
  - [Usage](#usage)

## Introduction

This README outlines a solution for on-demand monitoring of various Unix-based servers. This solution allows users to retrieve log files from `/var/log` on a target server by issuing REST requests, eliminating the need to log into individual machines and manually open log files.

## Design

To efficently retrieve the data current implementation uses [Readbable Stream](https://nodejs.org/api/stream.html#readable-streams)

- `BackwardReadStream` allows reading the content of a file in the form of custom streaming
- Chunks of data that are read consist of lines
- The end of a line is recognized using the `\n` separator
- The data is read backward - from the end of the file to the beginning
- Additional actions on the stream are performed through the 'data' event listener and callcback

## Prerequisites

Before using this solution, ensure the following prerequisites are met:

- Unix-based servers to be monitored
- Appropriate permissions to access log files in `/var/log` on the target servers


## Installation

1. Clone the repository to your local machine.

2. Start the server

    2.1 [Via Docker] By default the container will search inside the var/log directory

    ```
        npm run docker-start
    ```

    2.2 [On Host]
    ```
        npm run start
    ```

By default, the server listens on the port `3001`. To override the configuration you can use:

```
 PORT=3002 npm run start
```

## Documentation

The documentation API is available at the following endpoint after starting the server:

```
http://localhost:3001/api-docs/
```

## Utils

Contains a helper script to generate sample data - 1GB file with log.


## Usage

The REST API endpoint for log retrieval is:


Retrieve a specific log file (e.g. `auth.log`):

```
    curl "http://localhost:3001/logs?file=auth.log"
```

Retrieve `10` recent lines of a specific log file (e.g. `auth.log`):

```
    curl "http://localhost:3001/logs?file=auth.log&n=10"
```

Retrieve a specific log file (e.g. auth.log) where entries contains `system-logind`:

```
    curl "http://localhost:3001/logs?file=auth.log&keyword=systemd-logind"
```

To handle big file a line offset(line paging) mechanism is introduced (e.g. big_file.log)

```
    curl "http://localhost:3001/logs?file=big_file"
```


```
Nov 01 00:00:00 Lorem Ipsum log
{offset=1000000}
```

The value from offset can be used in the next query to start retrieving data from the specified line offset.
```
    curl "http://localhost:3001/logs?file=big_file&offset=1000000"
```

By default, the limit for parsed lines is hardcoded to 1,000,000. If you want to exceed this limit, you can pass n=-1 in the query.

```
    curl "http://localhost:3001/logs?file=big_file&n=-1"
```