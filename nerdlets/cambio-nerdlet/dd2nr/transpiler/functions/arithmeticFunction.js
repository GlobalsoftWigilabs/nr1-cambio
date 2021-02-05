function ddAbsToNRAbs() {
  return {
    functionAggregator: 'abs',
    useAggregatorParam: true,
    aggregatorParam: []
  };
}

function ddLog2ToNRLog2() {
  return {
    functionAggregator: 'log2',
    useAggregatorParam: true,
    aggregatorParam: []
  };
}

function ddLog10ToNRLog10() {
  return {
    functionAggregator: 'log10',
    useAggregatorParam: true,
    aggregatorParam: []
  };
}

export { ddAbsToNRAbs, ddLog2ToNRLog2, ddLog10ToNRLog10 };
