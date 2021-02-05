import * as Yup from 'yup';
/**
 * Validation Schema for the form setup
 */
const DatadogSchema = Yup.object().shape({
  apikey: Yup.string()
    .min(20, 'should be at least 20 characters')
    .max(50, 'should not be more than 50 characters')
    .required('Required'),
  appkey: Yup.string()
    .min(20, 'should be at least 20 characters')
    .max(50, 'should not be more than 50 characters')
    .required('Required')
});

/**
 * Validation Schema for the form setup
 */
const DatadogTempSchema = Yup.object().shape({
  apikey: Yup.string()
    .max(50, 'should not be more than 50 characters')
    .required('Required'),
  appkey: Yup.string()
    .max(50, 'should not be more than 50 characters')
    .required('Required')
});

export { DatadogSchema, DatadogTempSchema };
