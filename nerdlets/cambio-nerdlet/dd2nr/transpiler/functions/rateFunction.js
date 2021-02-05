function ddPerSecondToNRrate() {
  return {
    functionAggregator: 'rate',
    useAggregatorParam: true,
    aggregatorParam: ['1 second']
  };
}

function ddPerMinuteToNRrate() {
  return {
    functionAggregator: 'rate',
    useAggregatorParam: true,
    aggregatorParam: ['1 minute']
  };
}

function ddPerHourToNRrate() {
  return {
    functionAggregator: 'rate',
    useAggregatorParam: true,
    aggregatorParam: ['1 hour']
  };
}

export { ddPerSecondToNRrate, ddPerMinuteToNRrate, ddPerHourToNRrate };
