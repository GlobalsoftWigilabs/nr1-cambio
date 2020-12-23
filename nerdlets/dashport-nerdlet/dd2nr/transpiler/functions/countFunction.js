function ddcountNonzeroToNRcountNonzero() {
  return {
    aggregator: 'count',
    useWhereFunction: true,
    whereClause: '!= 0'
  };
}

function ddcountNotNullToNRcountNotNull() {
  return {
    aggregator: 'count',
    useWhereFunction: true,
    whereClause: 'is NOT NULL'
  };
}

export { ddcountNonzeroToNRcountNonzero, ddcountNotNullToNRcountNotNull };
