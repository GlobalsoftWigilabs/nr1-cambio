/**
 * SVG check icon on Checkbox inputs
 */
const BackgroundChecked =
  'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M9%2016.2L4.8%2012l-1.4%201.4L9%2019%2021%207l-1.4-1.4L9%2016.2z%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E';
/**
 * Custom style for selected Checkbox
 */
const styleChecked = {
  borderColor: '#767B7F',
  backgroundColor: '#0078bf',
  backgroundImage: `url(${BackgroundChecked})`,
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
};
/**
 * Custom style for unselected Checkbox
 */
const styleUnChecked = {
  borderColor: '#767B7F',
  backgroundColor: '#F7F7F8'
};
/**
 * Custom style for disabled Checkbox
 */
const styleDisabledChecked = { backgroundColor: '#ADADAD' };

const styleCheckedRadio = {
  borderColor: '#767B7F',
  backgroundColor: '#0078bf',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat'
};

export { styleChecked, styleUnChecked, styleDisabledChecked,styleCheckedRadio };
