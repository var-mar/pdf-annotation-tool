import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Auth from '../modules/Auth';
import PropTypes from 'prop-types';
import MyLocalize from '../modules/Localize';

class PdfInfoPage extends React.Component {

  static propTypes = {
      match: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired
  }

  state = {
      pdf_id: '',
      pdf_info :{}
  };

  componentDidMount() {
    this.loadPDFinfo();
  }

  loadPDFinfo = () =>{
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/getPDFInfo?id='+this.state.pdf_id);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        console.log('getPDFInfo from server: ',xhr.response);
        this.setState({
          pdf_info: xhr.response,
        });
      }
    });
    xhr.send();
  }

  render() {
    const { match, location, history } = this.props;
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    this.state.pdf_id = id;
    const pdf = this.state.pdf_info;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>

      <div className="sidebar" style={{ width: "25vw",padding:'15px' }}>
      {pdf.author?
        (
        <div>
        <a href="" onClick={() => {
          history.push("/pdf?url="+pdf.filename+"&id="+pdf._id);
        }}>Go to annotated this file</a>
        <hr/>
        <p><strong>{pdf.originalname}</strong></p>
        <p>{MyLocalize.translate('Description')}: {pdf.description}</p>
        <p>Author: <strong>{pdf.author}</strong></p>
        <p>Uploaded date: <strong>{pdf.author}</strong></p>
        <p>PDF fingerprint: <strong>{pdf.pdfInfo.pdfInfo.fingerprint}</strong></p>
        <p>Total pages: <strong>{pdf.pdfInfo.pdfInfo.numPages}</strong></p>
        <p>Create document date: <strong>{pdf.CreationDate}</strong></p>
        <p>Software generated: <strong>{pdf.pdfInfo.meta.info.Producer}</strong></p>
        <p>Metadata author: <strong>{pdf.pdfInfo.meta.info.Author}</strong></p>
        </div>
      ):null}
      </div>

      <div
        style={{
          height: "100vh",
          width: "75vw",
          overflowY: "scroll",
          position: "relative"
        }}
        className="pdfbar"
      >
      <div style={{'overflow': 'hidden'}}>
        <div style={{'float':'left','height':202,'margin-right':'10px','display':'inline-block'}}>
          <img src={pdf._id+".svg"} width="120" height="200" class="svg"/>
        </div>
      </div>
      <p><strong>Activity</strong></p>

      </div>

      </div>
    )
  }
};

export default PdfInfoPage;
