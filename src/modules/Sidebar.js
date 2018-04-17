// @flow


import React, {Component} from 'react';
import ReactDOM from 'react-dom';
//import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
//import 'react-selectize/themes/index.css'

import Select from 'react-select';
import 'react-select/dist/react-select.css';

import Auth from '../modules/Auth';
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
/*
function filterForm(){
  ReactDOM.render(
      React.createElement(
        SimpleSelect,
        {
          style: {width: 100},
          tether: true,
          placeholder: "Filter by author annotation",
          options : [{label:'See yours annotations',value:'yours'},{label:'See all annotations',value:'all'}]
        }
      ),
      document.getElementById("filter-form")
  );

}
*/
function Sidebar({ highlights, resetHighlights, deleteHighlights, handleChange, state}: Props) {

  const { selectedOption } = state;
  const value = selectedOption && selectedOption.value;
  var legendItems =[{name:'type1',color:'#ff0000'},{name:'type2',color:'#ff00ff'}]
  return (
      <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem"}}>
        <div style={{'border': '1px solid #000'}}>
        <p style={{'text-align': 'center'}}>Legend -  Annotation types</p>
        <ul>
        {legendItems.map((legendItem, index) => (
          <li style={{'list-style-type': 'none'}}><div style={{
            'background-color': legendItem.color,
            'width': 10,
            'height': 10,
            'margin-top': 5,
            'border-radius': '50%',
            'float':'left',
            'margin-right':10
          }}/>{legendItem.name}
          </li>
        ))}
        </ul>
        </div>
      </div>
      <div className="description" style={{ padding: "1rem" }}>
        <p>
          <small>
            MyLocalize.translate('To create area highlight hold ⌥ Option key (Alt), then click and drag.')
          </small>
        </p>
      </div>

      <input type="checkbox" className="checkbox-control" name="disabled" onChange={handleChange}/>
      See only my annotations

      <Select
      name="form-filter-annotations"
      value={value}
      onChange={handleChange}
      options={[
        { value: 'all',   label: MyLocalize.translate('See all annotations')},
        { value: 'yours', label: MyLocalize.translate('See yours annotations') },
      ]}
      />

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
            <div style={{
              'background-color': highlight.typeColor,
              'width': 10,
              'height': 10,
              'margin-top': 5,
              'border-radius': '50%',
              'float':'left',
              'margin-right':10
            }}/>
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
              Page {highlight.position.pageNumber} |
              {highlight.areYouTheAuthor? ( <span onClick={() => {deleteHighlights(highlight.id);}}>Delete</span>):null}

            </div>
          </li>

        ))}
      </ul>

    </div>
  );
}
/*





{highlights.length > 0 ? (
  <div style={{ padding: "1rem" }}>
    <a href="#" onClick={resetHighlights}>
      Reset highlights
    </a>
  </div>
) : null}
*/
export default Sidebar;
