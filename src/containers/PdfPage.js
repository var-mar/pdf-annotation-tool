import React, { Component } from 'react';
import URLSearchParams from "url-search-params";

import {
  PdfLoader,
  PdfAnnotator,
  Tip,
  Highlight,
  Popup,
  AreaHighlight
} from "react-pdf-annotator";

import testHighlights from "../modules/test-highlights";

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

const DEFAULT_URL = "https://arxiv.org/pdf/1708.08021.pdf";
//const DEFAULT_URL = "http://localhost:3000/pdf/eesti_infouhiskonna_arengukava.pdf";
//const DEFAULT_URL = "file:///Users/mcanet/Dropbox/OpenData-workshop2018/electron-with-create-react-app/build/static/pdf/eesti_infouhiskonna_arengukava.pdf";

const searchParams = new URLSearchParams(window.location.search);
const url = searchParams.get("url") || DEFAULT_URL;

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
    highlights: testHighlights[url] ? [...testHighlights[url]] : []
  };

  state: State;

  resetHighlights = () => {
    this.setState({
      highlights: []
    });
  };

  deleteHighlights = (id) => {
    var previousLen = this.state.highlights.length;
    var filterAr = this.state.highlights.filter(highlight => highlight.id !== id);
    console.log("deleteHighlights: ",previousLen, filterAr.length);

    // Delete locally
    this.setState({
      highlights: filterAr
    });

    // Send to delete for all
    let ws = getws();
    ws.send('deleteAnnotation',{'type':'deleteHighlights','id':id});
  };

  loadNewPDF = () => {
    getAnnotationsJson('http://localhost:3000/mmm.json');
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
    let ws = getws();
    ws.send('annotation',{'file':'saveAnnotations','data':highlights});

    this.setState({
      highlights: [{ ...highlight, id: getNextId() }, ...highlights]
    });
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
          loadNewPDF={this.loadNewPDF}
          deleteHighlights={this.deleteHighlights}
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
