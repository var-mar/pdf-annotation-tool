// @flow

import React from "react";
import Select from 'react-select';
import 'react-select/dist/react-select.css';

import MyLocalize from '../modules/Localize';

import type { T_Highlight } from "../../src/types";
type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  resetHighlights: () => void,
  handleChange: ()=> void,
  deleteHighlights:()=>void, //e: event
  state: Object
};

const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};

function Sidebar({ highlights, resetHighlights, deleteHighlights, handleChange, state}: Props) {

  const { selectedOption } = state;
  const value = selectedOption && selectedOption.value;

  return (
      <div className="sidebar" style={{ width: "25vw" }}>

      <div className="description" style={{ padding: "1rem" }}>
        <p>
          <small>
            MyLocalize.translate('To create area highlight hold ⌥ Option key (Alt), then click and drag.')
          </small>
        </p>

        <Select
        name="form-filter-annotations"
        value={value}
        onChange={handleChange}
        options={[
          { value: 'yours', label: MyLocalize.translate('See only yours annotations') },
          { value: 'all', label: MyLocalize.translate('See all annotations') },
        ]}
        />

      </div>

      <ul className="sidebar__highlights">
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber} | <span onClick={() => {
              deleteHighlights(highlight.id);
            }}>
          Delete</span>
            </div>
          </li>

        ))}
      </ul>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <a href="#" onClick={resetHighlights}>
            Reset highlights
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default Sidebar;
/* deleteHighlights id={highlight.id}*/
