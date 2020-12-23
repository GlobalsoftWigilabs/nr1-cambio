import React from 'react';
import App from './containers/App';
import { nerdlet } from 'nr1';

/**
 * Class that renders the main component
 *
 * @class Index
 * @extends {React.Component}
 */
class Index extends React.Component {
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
