const express = require('express');
const router = new express.Router();
const fs = require('fs');
const pdfUtils  = require('../utils/pdfUtils');
const multer  = require('multer');
const upload = multer({ dest: './pdfUpload' });
const pdf = require('../models/pdf');

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

router.get('/generateThumbnail', (req, res) => {
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
  pdf.find({},(err,docs)=>{
    res.status(200).json(docs)
  });
});

router.get('/deletePDFAnnotation', (req, res) => {
  console.log('called /deletePDFAnnotation:',req.query.pdfID, req.query.annotationID, req.user._id)
  pdf.removeAnnotation(req.query.pdfID, req.query.annotationID, req.user._id, function(cb){
    if(cb.retStatus=='success'){
      console.log('delete Annotations - success',cb.data)
      res.status(200).json();
    }else{
      console.log('delete Annotations - error')
      res.status(400).json();
    }
  });
});

router.get('/savePDFAnnotation', (req, res) => {
  console.log("called /savePDFAnnotation id:",req.query.id)
  var info = JSON.parse(req.query.info);

  pdf.saveAnnotation(req.query.id, info, req.user._id, req.user.name, function(cb){
    if(cb.retStatus=='success'){
      console.log('save Annotations - success',cb.data)
      res.status(200).json();
    }else{
      console.log('save Annotations - error')
      res.status(400).json();
    }
  });

});

router.get('/getAllPDFAnnotations', (req, res) => {
  console.log(req.user);
  console.log("called /getAllPDFAnnotations id:",req.query.id)
  pdf.getAnnotations(req.query.id,function(cb){
    if(cb.retStatus=='success'){
      console.log('getAnnotations - success',cb.data)
      res.status(200).json(cb.data);
    }else{
      console.log('getAnnotations - error')
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
  var pdfInfo = pdfUtils.extractInfo(path,function(pdfInfo){
    console.log('user:',req.body.user);
    // Save in Database
    var newPdf = new pdf();
    newPdf.filename = req.file.filename;
    newPdf.originalname = req.file.originalname;
    newPdf.path = req.file.path;
    newPdf.description = req.body.description;
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
		  }
    });
  });

  // respond that file got uploaded
  //res.status(200).json({});
});

module.exports = router;
