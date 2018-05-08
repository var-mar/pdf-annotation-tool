// @flow

import URLSearchParams from "url-search-params";
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
//import {ReactSelectize, SimpleSelect, MultiSelect} from 'react-selectize';
//import 'react-selectize/themes/index.css'

//import Select from 'react-select';
//import 'react-select/dist/react-select.css';

import Auth from '../modules/Auth';
import MyLocalize from '../modules/Localize';
import TipEdit from "../modules/TipEdit";
import type { T_Highlight } from "../../src/types";
type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  legends:[],
  resetHighlights: () => void,
  handleChange: ()=> void,
  deleteHighlights:()=>void, //e: event
  editHighlights:()=>void,
  state: Object
};

const searchParams = new URLSearchParams(window.location.search);

const openPage = (link) => {
  window.location = link;
  console.log('open:',link)
};

const updateHash = highlight => {
  window.location.hash = `highlight-${highlight.id}`;
};

function Sidebar({ highlights, legends,resetHighlights, deleteHighlights, editHighlights, handleChange, state}: Props) {
  const { selectedOption } = state;
  const value = selectedOption && selectedOption.value;
  //var legendItems =[{name:'type1',color:'#ff0000'},{name:'type2',color:'#ff00ff'}];
  console.log('legends Sidebar:',legends, Array.isArray(legends));
  const legendItems = legends;
  const legendLink ="/legends/"+searchParams.get("id");
  return (
      <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem"}}>
        <div style={{'border': '1px solid #000'}}>
        <p style={{'text-align': 'center'}}>Legend -  Annotation types</p>
        <ul>
        {legendItems.map((legendItem, index) => (
          <li style={{'list-style-type': 'none'}}>
            <div style={{
              'background-color': legendItem.color,
              'width': 10,
              'height': 10,
              'margin-top': 5,
              'border-radius': '50%',
              'float':'left',
              'margin-right':10
            }}/>{legendItem.name} {legendItem.count>0?('('+legendItem.count+')'):null}
          </li>
        ))}
        </ul>
        <a href="#" onClick={() => {
          openPage(legendLink);
        }}>{MyLocalize.translate('Edit legends')}</a>
        </div>
      </div>
      <div className="description" style={{ padding: "1rem" }}>
        <p>

        </p>
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

            {highlight.editMode?
              <select name={highlight.id+"_edit_type"} style={{'width':'100%'}}>
                {legendItems.map((legendItem, index) => (
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
              :<div style={{
              'background-color': highlight.typeColor,
              'width': 10,
              'height': 10,
              'margin-top': 5,
              'border-radius': '50%',
              'float':'left',
              'margin-right':10
            }}/>}

              {highlight.editMode?
              ( <textarea
                id={highlight.id+"_edit_comment"}
                width="100%"
                autoFocus
                defaultValue={highlight.comment.text}
              />):(<strong>{highlight.comment.text}</strong>)
              }
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
              {highlight.areYouTheAuthor==false? (<span>Author: {highlight.author}</span>):(<span>Author: you</span>)} |
              Page {highlight.position.pageNumber} |
              {highlight.areYouTheAuthor? ( <span><span onClick={() => {deleteHighlights(highlight.id);}}>Delete</span> | </span>):null}
              {highlight.areYouTheAuthor && highlight.editMode?
                (<span onClick={()=> {editHighlights('save',highlight.id);}}>Save</span>):
                (<span onClick={()=> {editHighlights('edit',highlight.id);}}>Edit</span>)
              }

            </div>
          </li>

        ))}
      </ul>

    </div>
  );
}
/*

<small>
  {MyLocalize.translate('To create area annotation hold ⌥ Option key (Alt), then click and drag.')}
</small>


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


<TipEdit
  onOpen={e.stopPropagation()}
  highlight={highlight}
  onConfirm={comment => {
    //console.log({ content, position, comment });
    //this.addHighlight({ content, position, comment });
    //hideTipAndSelection();
    editHighlights();
  }}
/>





{highlights.length > 0 ? (
  <div style={{ padding: "1rem" }}>
    <a href="#" onClick={resetHighlights}>
      Reset highlights
    </a>
  </div>
) : null}
*/
export default Sidebar;
