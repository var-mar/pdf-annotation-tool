/*
This component deals to Upload PDF
*/
import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import MyLocalize from '../modules/Localize';
import Auth from '../modules/Auth';

function sendAttachedPDF(callback) {
  // form validation
  var fileName = document.getElementById("form-pdf-upload").pdf.files.length!=0;
  var fileDescription = document.getElementById("form-pdf-upload").description.value;
  if(fileName=="" && fileDescription==""){
    document.getElementById("formOutput").innerHTML = MyLocalize.translate("It is missing to choose file and description");
    return;
  }else if(fileName==""){
    document.getElementById("formOutput").innerHTML = MyLocalize.translate("It is missing to choose file");
    return;
  }else if(fileDescription==""){
    document.getElementById("formOutput").innerHTML = MyLocalize.translate("It is missing the description");
    return;
  }

  // Send Data to server
  var formData = new FormData(document.getElementById("form-pdf-upload"));
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/uploadPDF');
  // set the authorization HTTP header
  xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
  xhr.responseType = 'json';
  xhr.addEventListener('load', () => {
    if (xhr.status === 200) {
      document.getElementById("form-pdf-upload").reset();
      document.getElementById("formOutput").innerHTML = "";
      callback();
    }
  });
  xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var percentComplete = (e.loaded / e.total) * 100;
        console.log(percentComplete + '% uploaded');
      }
  };
  xhr.send(formData);
}
type Props = {
  loadAllPDF: ()=> void
};

const PdfUploadForm = ({ loadAllPDF }: Props) => (
  <div id="pdfUploadForm">
    <form id="form-pdf-upload" name="form-pdf-upload" method="POST" encType="multipart/form-data">
      <input type="file" name="pdf" accept="application/pdf"/>
      <span class="formText">Description: </span><input type="text" name="description"/>
    </form>
    <button onClick={() => {sendAttachedPDF(loadAllPDF)}}>{MyLocalize.translate('Save')}</button>
    <p class="formWarnings" id="formOutput"></p>
  </div>
);

export default PdfUploadForm;
