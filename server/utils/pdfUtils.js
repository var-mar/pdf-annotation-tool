const PDFExtract = require('pdf.js-extract').PDFExtract;

exports.extractInfo = function(path,callback){
      var pdfExtract = new PDFExtract();
      var options = {}; /* options are handed over to pdf.js e.g, { password: 'somepassword' } */
      console.log(path);
      pdfExtract.extract(path, options , function (err, data) {
          if (err) return console.log(err);
          console.log(data);
          callback(data);
      });
}

exports.generatePDFAnnotated = function(id,callback){
  const hummus = require('hummus');
  const PDFRStreamForBuffer =require('../utils/PDFRStreamForBuffer');
  callback();
}
