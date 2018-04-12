
/*
var pdfUtils  = require('./utils/pdfUtils');
var path = './pdfUpload/cce6aa3d65f37354d40476eb2d59a5f1.pdf';
var pdfInfo = pdfUtils.extractInfo(path,function(pdfInfo){
});
*/

var path = '/Users/mcanet/Dropbox/OpenData-workshop2018/dev/pdf-annotation-tool/pdfUpload/cce6aa3d65f37354d40476eb2d59a5f1.pdf';

const PDFExtract = require('pdf.js-extract').PDFExtract;
var pdfExtract = new PDFExtract();
var options = {}; /* options are handed over to pdf.js e.g, { password: 'somepassword' } */
pdfExtract.extract(path, options , function (err, data) {
    if (err) return console.log(err);
    console.log(data);
    //callback(data);
});
