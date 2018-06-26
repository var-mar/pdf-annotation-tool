import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import URLSearchParams from "url-search-params";
import MyLocalize from '../modules/Localize';
import Auth from '../modules/Auth';
import PropTypes from 'prop-types';

import {
  PdfLoader,
  PdfAnnotator,
  /*Tip,*/
  /*Highlight,*/
  Popup,
  AreaHighlight
} from "react-pdf-highlighter";
import Tip from "../modules/Tip";
import Highlight from "../modules/Highlight";

import { _ } from 'underscore'
import Spinner from "../modules/Spinner";
import Sidebar from "../modules/Sidebar";
import { getws } from './../WebSocket'
import type { T_Highlight, T_NewHighlight } from "../src/types";

import "../style/Pdf.css";

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>
};

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () => window.location.hash.slice("#highlight-".length);

const resetHash = () => {
  window.location.hash = "";
};

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

const searchParams = new URLSearchParams(window.location.search);
//const url = searchParams.get("url");
//console.log('url:',url)

async function getAnnotationsJson(filePath) {
  try {
    let response = await fetch(filePath);
    let responseJson = await response.json();
    return responseJson;
   } catch(error) {
    //console.error(error);
    console.log(error);
  }
}

class PdfPage extends Component<Props, State> {

  static propTypes = {
      match: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired
  }

  state = {
    pdf_id: '',
    selectedOption: '',
    highlights: [],
    legends:[],
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: [],
      legends:[]
    });
  };

  getColorType = (id,legends) => {
    console.log(id,legends)
    try{
      return (legends.find(legendItem => legendItem._id === id)).color;
    }catch(err){
      return '';
    }
  }

  getColorToAnnotations = (annotations,legends) => {
    for(var i=0;i<annotations.length;i++){
      annotations[i].typeColor = this.getColorType(annotations[i].type,legends);
    }
    return annotations;
  }

  getCountTypeAnnotations = (annotations,legends)=>{
    for(var j=0;j<legends.length;j++){
      legends[j].count = 0;
      for(var i=0;i<annotations.length;i++){
        if(annotations[i].type == legends[j]._id) legends[j].count += 1;
      }
    }
    return legends;
  }

  loadAllPDFAnnotations = () => {
    //var formData = new FormData();
    //formData.append('pdf_id',this.state.pdf_id)
    console.log('loadAllPDFAnnotations = this.state.pdf_id:',this.state.pdf_id)

    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/getAllPDFAnnotations?id='+this.state.pdf_id);//searchParams.get("id"));
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log('getAllAnnotations from server: ',xhr.response);
        var annotations = xhr.response.annotations;
        var legends = xhr.response.legends;
        // Add count types to legends
        legends = this.getCountTypeAnnotations(annotations,legends);
        // Add colour type to all anotations
        annotations = this.getColorToAnnotations(annotations,legends);

        this.setState({
          highlights: _.sortBy(annotations,'sortPosition'),
          legends: legends,
        });
      }
    });
    xhr.send();
  }

  handleChange = (selectedOption) => {
    //this.setState({ selectedOption });
    //console.log(`Selected: ${selectedOption.label}`);

    console.log(selectedOption);
    //console.log(document.getElementById(selectedOption).value);
  }

  editHighlights = (action,id) => {
      console.log('edit annotation',this.state.legends)
      const { highlights } = this.state;
      if(action=='edit'){
        // set to edit mode
        //console.log('total hightlights',highlights.length);
        var highlight = this.getHighlightById(id);
        highlight.editMode = true;
        // Update
        this.setState({
          highlights: highlights
        });
      }else{
        var highlight = this.getHighlightById(id);
        highlight.editMode = false;

        var typeSelect = document.getElementById(id+"_edit_type");
        console.log(typeSelect);
        var type = typeSelect.options[typeSelect.selectedIndex].value;
        console.log(type);
        var comment =  document.getElementById(id+"_edit_comment").value;
        console.log('comment',comment);
        //send Update to server
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/api/updatePDFAnnotation?id='+this.state.pdf_id+'&idA='+id+'&comment='+comment+'&type='+type);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        // set the authorization HTTP header
        xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
        xhr.responseType = 'json';
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            this.loadAllPDFAnnotations();
            console.log('Saved the Annotations to server: ',xhr.response);

          }
        });
        xhr.send();
      }
  }

  deleteHighlights = (id) => {
    if (!window.confirm("Do you really want to delete?")) return;
    var previousLen = this.state.highlights.length;
    var filterAr = this.state.highlights.filter(highlight => highlight.id !== id);
    console.log("deleteHighlights: ",previousLen, filterAr.length);

    // Delete locally
    this.setState({
      highlights: filterAr
    });

    // Send to delete for all
    //let ws = getws();
    //ws.send('deleteAnnotation',{'type':'deleteHighlights','id':id});

    // Delete annotation to server
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/deletePDFAnnotation?pdfID='+this.state.pdf_id+'&annotationID='+id);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log('Saved the Annotations to server: ',xhr.response)
      }
    });
    xhr.send();
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
    // load Annotation
    this.loadAllPDFAnnotations();
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find(highlight => highlight.id === id);
  }

  addHighlight(highlight: T_NewHighlight) {
    const { highlights } = this.state;
    console.log('Is type is full:',highlight.type)
    console.log("Saving highlight", highlight);

    //var newJson = {:highlights};
    //console.log(highlights);
    //let ws = getws();
    //ws.send('annotation',{'file':'saveAnnotations','data':highlights});

    var newHighlight = { ...highlight, id: getNextId() };

    // save to server
    var annotationObj = JSON.stringify(newHighlight);
    console.log(annotationObj)
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/savePDFAnnotation?id='+this.state.pdf_id+'&info='+annotationObj);

    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {

        this.loadAllPDFAnnotations();
        console.log('Saved the Annotations to server: ',xhr.response)
      }
    });
    xhr.send();
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.setState({
      highlights: this.state.highlights.map(h => {
        return h.id === highlightId
          ? {
              ...h,
              position: { ...h.position, ...position },
              content: { ...h.content, ...content }
            }
          : h;
      })
    });
  }

  render() {
    const { match, location, history } = this.props;
    const { highlights } = this.state;
    const {legends} = this.state;

    const params = new URLSearchParams(location.search)
    const url = params.get('url');
    const id = params.get('id');

    this.state.pdf_id = id;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          legends ={legends}
          resetHighlights={this.resetHighlights}
          deleteHighlights={this.deleteHighlights}
          editHighlights={this.editHighlights}
          handleChange={this.handleChange}
          state = {this.state}
        />

        <div
          style={{
            height: "100vh",
            width: "75vw",
            overflowY: "scroll",
            position: "relative"
          }}
        >

          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {pdfDocument => (
              <PdfAnnotator
                pdfDocument={pdfDocument}
                enableAreaSelection={event => event.altKey}
                onScrollChange={resetHash}
                scrollRef={scrollTo => {
                  this.scrollViewerTo = scrollTo;
                  this.scrollToHighlightFromHash();
                }}
                url={url}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    legends={legends}
                    onOpen={transformSelection}
                    onConfirm={(comment,type) => {
                      this.addHighlight({ content, position, comment,type });
                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  const component = isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                      typeColor={highlight.typeColor}
                    />
                  ) : (
                    <AreaHighlight
                      highlight={highlight}
                      onChange={boundingRect => {
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) }
                        );
                      }}
                    />
                  );

                  return (
                    <Popup
                      popupContent={<HighlightPopup {...highlight} />}
                      onMouseOver={popupContent =>
                        setTip(highlight, highlight => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                      children={component}
                    />
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
      </div>
    );
  }
}

export default PdfPage;
