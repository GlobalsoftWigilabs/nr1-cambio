import React from 'react';
import App from './containers/App';
import { nerdlet } from 'nr1';

/**
 * Class that renders the main component
 *
 * @class Index
 * @extends {React.PureComponent}
 */
class Index extends React.PureComponent {
  constructor(props) {
    super(props);

    nerdlet.setConfig({
      headerTitle: 'Cambio',
      timePicker: false
    });
  }

  render() {
    return <App />;
  }
}
export default Index;
