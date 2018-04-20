import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Auth from '../modules/Auth';
import { SketchPicker } from 'react-color';

class LegendsPage extends React.Component {

  state = {
      background: '#fff',
  };

  componentDidMount() {

  }

  handleChangeComplete = (color) => {
     this.setState({ background: color.hex });
  };

  render() {
    return (
      <Card className="container">
        <CardTitle title="React Application" subtitle="This is the home page." />

        <SketchPicker
        color={ this.state.background }
        onChangeComplete={ this.handleChangeComplete }
        />
      </Card>
    )
  }
};

export default LegendsPage;
