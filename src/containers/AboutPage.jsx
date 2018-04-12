import React from 'react';
import Auth from '../modules/Auth';
import { getws } from './../WebSocket'
import MyLocalize from '../modules/Localize';

class AboutPage extends React.Component {

  /**
   * Class constructor.
   */
  constructor(props) {
    super(props);

  }

  /**
   * This method will be executed after initial rendering.
   */
  componentDidMount() {

  }

  /**
   * Render the component.
   */
  render() {
    return (
    <div className="container">
    <p style={{ fontSize: '16px', color: 'black' }}> This tool has been made by <a href="http://var-mar.info/">Varvara & Mar</a> with the support of Eesti open data.</p>
    <p style={{ fontSize: '16px', color: 'black' }}> The tool is open source and it is publish in github account: <a href="https://github.com/var-mar/pdf-annotation-tool">https://github.com/var-mar/pdf-annotation-tool</a>.</p>
    </div>);
  }

}

export default AboutPage;
