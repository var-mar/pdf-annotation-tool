import React, { Component } from 'react';
import URLSearchParams from "url-search-params";
import MyLocalize from '../modules/Localize';
import Auth from '../modules/Auth';

import {
  PdfLoader,
  PdfAnnotator,
  /*Tip,*/
  /*Highlight,*/
  Popup,
  AreaHighlight
} from "react-pdf-annotator";
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
const url = "/"+searchParams.get("url");

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

  state = {
    pdf_id: '',
    selectedOption: '',
    highlights: []
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: []
    });
  };

  loadAllPDFAnnotations = () => {
    //var formData = new FormData();
    //formData.append('pdf_id',this.state.pdf_id)

    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/getAllPDFAnnotations?id='+searchParams.get("id"));
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log('getAllAnnotations from server: ',xhr.response);

        this.setState({
          highlights: _.sortBy(xhr.response,'sortPosition'),
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

  deleteHighlights = (id) => {
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
    xhr.open('get', '/api/deletePDFAnnotation?pdfID='+searchParams.get("id")+'&annotationID='+id);

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
    xhr.open('get', '/api/savePDFAnnotation?id='+searchParams.get("id")+'&info='+annotationObj);

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
    const { highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          deleteHighlights={this.deleteHighlights}
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
                    onOpen={transformSelection}
                    onConfirm={comment => {
                      this.addHighlight({ content, position, comment });

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
