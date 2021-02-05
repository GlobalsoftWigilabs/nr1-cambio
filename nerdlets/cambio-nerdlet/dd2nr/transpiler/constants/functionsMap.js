import {
  PER_SECOND,
  PER_MINUTE,
  PER_HOUR,
  ABS,
  LOG2,
  LOG10,
  TOP,
  COUNT_NONZERO,
  COUNT_NOT_NULL
} from './functionsMapConvert';

import {
  ddPerSecondToNRrate,
  ddPerMinuteToNRrate,
  ddPerHourToNRrate
} from '../functions/rateFunction';

import {
  ddAbsToNRAbs,
  ddLog2ToNRLog2,
  ddLog10ToNRLog10
} from '../functions/arithmeticFunction';

import { ddTopToNRTop } from '../functions/rankFunction';

import {
  ddcountNonzeroToNRcountNonzero,
  ddcountNotNullToNRcountNotNull
} from '../functions/countFunction';

const CONVERT_FUNCTIONS_MAP = {
  [PER_SECOND]: () => ddPerSecondToNRrate(),
  [PER_MINUTE]: () => ddPerMinuteToNRrate(),
  [PER_HOUR]: () => ddPerHourToNRrate(),
  [ABS]: () => ddAbsToNRAbs(),
  [LOG2]: () => ddLog2ToNRLog2(),
  [LOG10]: () => ddLog10ToNRLog10(),
  [TOP]: () => ddTopToNRTop(),
  [COUNT_NONZERO]: () => ddcountNonzeroToNRcountNonzero(),
  [COUNT_NOT_NULL]: () => ddcountNotNullToNRcountNotNull()
};

export { CONVERT_FUNCTIONS_MAP };
