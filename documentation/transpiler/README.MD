# Comparisons queries

# Easy

DataDog

```bash

avg:system.load.1{*} by {host}

```

New Relic

```bash

SELECT average(loadAverageOneMinute) FROM SystemSample FACET hostname TIMESERIES 

```

DataDog

```bash

max:system.load.5{*} by {host}

```

New Relic

```bash

SELECT max(loadAverageFiveMinute) FROM SystemSample FACET hostname TIMESERIES

```

DataDog

```bash

sum:system.cpu.user{*} by {host}

```

New Relic

```bash

SELECT sum(cpuUserPercent) FROM SystemSample FACET hostname TIMESERIES

```

# Complicated

DataDog

```bash

avg:system.load.1{*}-avg:system.cpu.user{*}

```

New Relic

```bash

SELECT average(loadAverageOneMinute) - average(cpuUserPercent) FROM SystemSample FACET agentName TIMESERIES 

```

DataDog

```bash

((avg:system.cpu.user{*}*avg:system.load.1{*})+(avg:system.load.5{*}/avg:system.load.15{*})+avg:system.cpu.user{*})

```

New Relic

```bash

SELECT ((average(cpuUserPercent) * average(loadAverageOneMinute)) + (average(loadAverageFiveMinute) / average(loadAverageFifteenMinute)) + average(cpuUserPercent)) FROM SystemSample FACET agentName TIMESERIES 

```

# Difficult

DataDog

```bash

avg:system.load.1{*}, avg:system.load.5{*}, avg:system.load.15{*}

```

New Relic

```bash

SELECT average(loadAverageOneMinute), average(loadAverageFiveMinute), average(loadAverageFifteenMinute) FROM SystemSample TIMESERIES 

```

DataDog

```bash

avg:system.load.1{*}, avg:system.load.5{*}, avg:system.load.15{*}, (avg:system.load.1{*}+avg:system.load.5{*}+avg:system.load.15{*})

```

New Relic

```bash

SELECT average(loadAverageOneMinute), average(loadAverageFiveMinute), average(loadAverageFifteenMinute), average(loadAverageOneMinute) + average(loadAverageFiveMinute) + average(loadAverageFifteenMinute) FROM SystemSample TIMESERIES 

```