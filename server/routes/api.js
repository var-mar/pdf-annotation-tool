const express = require('express');
const router = new express.Router();
const fs = require('fs');
const pdfUtils  = require('../utils/pdfUtils');
const multer  = require('multer');
const upload = multer({ dest: './pdfUpload' });
const pdf = require('../models/pdf');
const mongoose = require('mongoose');

router.get('/dashboard', (req, res) => {
  console.log('dashboard is serve');
  res.status(200).json({
    message: "You're authorized to see this secret message.",
    // user values passed through from auth middleware
    user: req.user
  });
});

router.get('/getUserData', (req, res) => {
  console.log('Requested user data');
  res.status(200).json({
    user: req.user
  });
});

router.get('/downloadFile', (req, res) => {
  console.log(req.query);
  console.log('router download:','/'+req.query.path, req.query.downloadname)
  res.setHeader('content-disposition', 'attachment;filename='+req.query.downloadname);
  res.download(req.query.path, req.query.downloadname);
});

router.get('/downloadAnnotatedFile', (req, res) => {
  pdfUtils.generatePDFAnnotated(req.query.id,function(){
    // download
    console.log(req.query);
    console.log('router download:','/'+req.query.path+'_annotated', req.query.downloadname)
    res.setHeader('content-disposition', 'attachment;filename='+req.query.downloadname);
    res.download(req.query.path+'_annotated', req.query.downloadname);
  });
});

router.get('/getAllPDF', (req, res) => {
  pdf.getAllPDF(req.user._id, function(cb){
    res.status(200).json(cb.data);
  });
});

// this delete one annotation in the PDF
router.get('/deletePDFAnnotation', (req, res) => {
  console.log('called /deletePDFAnnotation:',req.query.pdfID, req.query.annotationID, req.user._id)
  pdf.removeAnnotation(req.query.pdfID, req.query.annotationID, req.user._id, function(cb){
    if(cb.retStatus=='success'){
      console.log('delete Annotations - success',cb.data)

      // Generate new SVG from new annotation
      pdfUtils.generateSVG(req.query.pdfID,req.user._id,120,200);
      console.log('save SVG');

      // send response
      res.status(200).json();
    }else{
      console.log('delete Annotations - error')
      res.status(400).json();
    }
  });
});

// This delete PDF
router.get('/deletePDF', (req, res) => {
  console.log('Called /deletePDF');
  // delete in database
  pdf.findByIdAndRemove(req.query.id, function (err, user) {

  });
  //detele file
  fs.unlink(req.query.path, function (err) {
  });
  res.status(200).json();
});

router.get('/savePDFAnnotation', (req, res) => {
  console.log("called /savePDFAnnotation id:",req.query.id)
  var info = JSON.parse(req.query.info);

  pdf.saveAnnotation(req.query.id, info, req.user._id, req.user.name, function(cb){
    if(cb.retStatus=='success'){
      console.log('save Annotations - success',cb.data)

      // Generate new SVG from new annotation
      pdfUtils.generateSVG(req.query.id,req.user._id,120,200);
      console.log('save SVG');

      // Send response to request
      res.status(200).json();
    }else{
      console.log('save Annotations - error');
      res.status(400).json();
    }
  });
});

router.get('/updatePDFAnnotation', (req, res) => {
  console.log("called /updatePDFAnnotation id:",req.query.id," text:"+req.query.comment);

  pdf.updateAnnotation(req.query.id,req.user._id,req.query.idA,req.query.comment,req.query.type,function(cb){
    if(cb.retStatus=='success'){
      console.log('getPDF - success');
      res.status(200).json({});
    }else{
      console.log('getPDF - error');
      res.status(200).json({});
    }
  });

});

router.get('/getPDFInfo', (req, res) => {
  console.log("called /getPDF id:",req.query.id)
  pdf.getPDF(req.query.id,req.user._id,function(cb){
    if(cb.retStatus=='success'){
      console.log('getPDF - success');
      res.status(200).json(cb.data);
    }else{
      console.log('getPDF - error');
      res.status(200).json({});
    }
  });
});

router.get('/getAllPDFAnnotations', (req, res) => {
  console.log("called /getAllPDFAnnotations id:",req.query.id)
  pdf.getAnnotations(req.query.id,req.user._id,function(cb){
    if(cb.retStatus=='success'){
      console.log('getAnnotations - success');
      res.status(200).json(cb.data);
    }else{
      console.log('getAnnotations - error');
      res.status(200).json({});
    }
  });
});

// Upload PDF to server
router.post('/uploadPDF', upload.single('pdf'), (req, res) => {
  console.log(req.file);
  var path = "./"+req.file.path;
  /*
  // rename file
  fs.renameSync(path, path+'.pdf', function (err) {
  });
  path = "./"+req.file.path+".pdf";
  console.log("path: "+path);
  */
  try{
  var pdfInfo = pdfUtils.extractInfo(path,function(pdfInfo){
    console.log('user:',req.body.user);
    // Save in Database
    var newPdf = new pdf();
    newPdf.filename = req.file.filename;
    newPdf.originalname = req.file.originalname;
    newPdf.path = req.file.path;
    newPdf.description = req.body.description;
    // get size
    pdfInfo.documentSize = pdfUtils.getDocumentSize(pdfInfo);
    newPdf.pdfInfo = pdfInfo;
    newPdf.author = req.user.name;
    newPdf.authorID = req.user._id;

    console.log(newPdf);
    newPdf.save(function (err,data) {
      if (err){console.log('error');
			   console.log('Error savind PDF:',err);
         res.status(400).json({});
		  }else{
			   console.log('Saved pdf');
         res.status(200).json({});
         // save empty SVG
         console.log("data",data);
         pdfUtils.saveSVGThumbnail(data._id,120,200,'');
		  }
    });
  });
}catch(err){}

  // respond that file got uploaded
  //res.status(200).json({});
});

module.exports = router;

// https://github.com/agentcooper/pdf-annotation-service
/*
let annotations = [];
 try {
   const urlObject = urlTools.parse(req.url, true);
   annotations = JSON.parse(urlObject.query.annotations);
 } catch (e) {
   res.end('Fail');
 }

 let body = [];

 req
   .on('data', chunk => {
     body.push(chunk);
   })
   .on('end', () => {
     body = Buffer.concat(body);
     console.log('Got buffer');

     const inStream = new PDFRStreamForBuffer(body);
     const outStream = new hummus.PDFStreamForResponse(res);

     console.log('Working...');
     work(annotations, inStream, outStream);

     console.log('Done');
     res.end();
   });
*/
