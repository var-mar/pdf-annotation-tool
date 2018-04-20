// @flow

import React, { Component } from "react";

type State = {
  text: string,
  emoji: string,
  legendType:string
};

type Props = {
  onConfirm: (comment: { text: string, emoji: string }) => void,
  onOpen: () => void,
  onUpdate?: () => void
};

class TipEdit extends Component<Props, State> {
  state = {
    text: "",
    emoji: "",
    legendType:""
  };

  state: State;
  props: Props;

  // for TipContainer
  componentDidUpdate(nextProps: Props, nextState: State) {
    const { onUpdate } = this.props;

    if (onUpdate) {
      onUpdate();
    }
  }

  render() {
    console.log('trying render tipEdit');
    const { onConfirm, onOpen } = this.props;
    const { text, emoji } = this.state;

    return (
      <div className="Tip">
          <form
            className="Tip__card"
            onSubmit={event => {
              event.preventDefault();
              onConfirm({ text, emoji });
            }}
          >
            <div>
              <textarea
                width="100%"
                placeholder="Your comment"
                autoFocus
                value={Props.highlight.text}
                onChange={event => this.setState({ text: event.target.value })}
                ref={node => {
                  if (node) {
                    node.focus();
                  }
                }}
              />
              <div>
                {Props.highlight.map(legend => (
                  <label>
                    <input
                      checked={emoji === legend._id}
                      type="radio"
                      name="legendType"
                      value={legend._id}
                      onChange={event =>
                        this.setState({ legendType: event.target.value })
                      }
                    />
                    {legend.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <input type="submit" value="Save" />
            </div>
          </form>
      </div>
    );
  }
}

export default TipEdit;
