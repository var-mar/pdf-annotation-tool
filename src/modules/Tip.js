// @flow

import React, { Component } from "react";

import "../style/Tip.css";

//import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
//import 'react-selectize/themes/index.css'

//import Select from 'react-select';
//import 'react-select/dist/react-select.css';

type State = {
  compact: boolean,
  text: string,
  emoji: string,
  type:string
};

type Props = {
  onConfirm: (comment: { text: string, emoji: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void,
  legends:Array<Object>
};

class Tip extends Component<Props, State> {
  state = {
    compact: true,
    text: "",
    emoji: "",
    type:""
  };

  state: State;
  props: Props;

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate && this.state.compact !== nextState.compact) {
      onUpdate();
    }
  }

  render() {
    const { onConfirm, onOpen,legends } = this.props;
    const { compact, text, emoji,type } = this.state;

    return (
      <div className="Tip">
        {compact ? (
          <div
            className="Tip__compact"
            onClick={() => {
              onOpen();
              this.setState({ compact: false });
            }}
          >
            Add annotation
          </div>
        ) : (
          <form
            className="Tip__card"
            onSubmit={event => {
              event.preventDefault();
              onConfirm({ text, emoji },type);
            }}
          >
            <div>
              <textarea
                width="100%"
                placeholder="Your comment"
                autoFocus
                value={text}
                onChange={event => this.setState({ text: event.target.value })}
                ref={node => {
                  if (node) {
                    node.focus();
                  }
                }}
              />
              <div>
              <label>Type annotation:</label>
              <select style={{'width':'100%'}}

                onChange={event =>
                  this.setState({ type: event.target.value })
                }
              >
                  <option value="" disabled selected hidden>Please type annotation ...</option>
                {legends.map((legendItem, index) => (
                  <option key={legendItem._id} value={legendItem._id}>
                    <div style={{
                    'background-color': legendItem.color,
                    'width': 10,
                    'height': 10,
                    'margin-top': 5,
                    'border-radius': '50%',
                    'float':'left',
                    'margin-right':10
                    }}/>
                    {legendItem.name}
                  </option>
                ))};
              </select>

              </div>
            </div>
            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default Tip;
