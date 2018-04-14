const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdf = require('../models/pdf');
const fs = require('fs');

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

exports.generateSVG = function(id,vizSizeWidth,vizSizeHeight){

  pdf.getPDF(id,function(cb){
    var output = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+vizSizeWidth+'" height="'+vizSizeHeight+'">\r\n'
    if(cb.retStatus=='success'){
      var FRWidth  = vizSizeWidth/cb.data.pdfInfo.documentSize.width;
      var FRHeight = vizSizeHeight/cb.data.pdfInfo.documentSize.height;

      var annotations = cb.data.annotations;
      for(var i=0; i<annotations.length; i++){
        var position = annotations[i].position;
        for(var j=0; j<position.rects.length;j++){
          //console.log("===> annotations-rect",position.rects[j]);
          var  pageNumber = position.pageNumber;
          var FZWidth = cb.data.pdfInfo.pages[pageNumber-1].pageInfo.width / position.rects[j].width;
          var FZHeight = cb.data.pdfInfo.pages[pageNumber-1].pageInfo.height / position.rects[j].height;

          output +='<rect'
          output +=' x="'+(position.rects[j].x1*FRWidth *FZWidth)+'"';
          output +=' y="'+(( ((pageNumber-1)*position.rects[j].height)+position.rects[j].y1)*FRHeight*FZHeight)+'"';
          var width = (position.rects[j].x2-position.rects[j].x1)  *FZWidth*FRWidth;
          var height = (position.rects[j].y2-position.rects[j].y1) *FZHeight*FRHeight;
          output +=' width="'+(width)+'"';
          output +=' height="'+(height)+'"';
          output +=' style="fill:red;stroke: black;stroke-width:5;opacity:0.5"';
          output +=' />\r\n';
        }
      }
    }
    output +='</svg>';
    // save svg file
    exports.saveSVGThumbnail(id,vizSizeWidth,vizSizeHeight, output);
  });
}

exports.saveSVGThumbnail = function(id,width,height,data){
  var output = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="'+width+'" height="'+height+'">\r\n'
  output += data;
  output +='</svg>';
  fs.writeFile("./svgThumbnails/"+id+".svg", output, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("SVG file was saved!");
  });
}

exports.getDocumentSize = function(info){
  // get total size document
  var widthMax = 0;
  var totalHeight = 0;
  console.log("total pages:",info.pdfInfo.numPages);
  if(info.pdfInfo.numPages>0){
    for(var i=0;i<info.pages.length;i++){
      totalHeight += info.pages[i].pageInfo.height;
      if(info.pages[i].pageInfo.width > widthMax)  widthMax = info.pages[i].pageInfo.width;
    }
  }
  return {width:widthMax,height:totalHeight};
}
