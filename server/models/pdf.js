const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');

// Define the Annotation model schema
const AnnotationSchema = new Schema({
    /* originals fields */
    content:{
        type:Object,
        required:true
    },
    sortPosition:{
        type:Number,
        required:true
    },
    position:{
        type:Object,
        required:true
    },
    comment:{
        type:Object,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    /* added fields */
    type:{
        type:String,
        required:false,
        default:""
    },
    typeColor:{
        type:String,
        required:false,
        default:"#FF0000"
    },
    authorID:{
        type:String,
        required:true,
        default:"anonymous"
    },
    author:{
        type:String,
        required:true,
        default:"anonymous"
    },
    createDate:{
        type:String,
        required:false,
        default: Date.now
    }
});

// Define the Pdf model schema
const PDFSchema = new Schema({
    filename:{
        type:String,
        required:true
    },
    originalname:{
        type:String,
        required:true
    },
    path:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    pdfInfo:{
        type:Object,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    authorID:{
        type:String,
        required:true
    },
    annotations: {type: [AnnotationSchema]},
    createDate:{
        type:Date,
        required:false,
        default: Date.now
    },
    public:{
        type:Boolean,
        required:false,
        default: true
    }
},{
  usePushEach: true
});

// Add annotation --------------------------------------------------------------------------
PDFSchema.statics = {
  saveAnnotation : function(pdfID, info, authorID,author, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);
    var AnnotationModel = mongoose.model('Annotation',AnnotationSchema);

    var annotationModel = new AnnotationModel();
    // Original fields
    annotationModel.content = info.content;
    annotationModel.position = info.position;
    annotationModel.comment = info.comment;
    annotationModel.id = info.id;

    // position first annotation in the page
    annotationModel.sortPosition = parseFloat(info.position.pageNumber)+(parseFloat(info.position.rects[0].y1/info.position.rects[0].height));

    // Added fields
    annotationModel.authorID = authorID;
    annotationModel.author = author;

    // find PDF to add new annotations
    PdfModel.findOne({_id: pdfID}, function(err, pdf) {
        if (err) {
            cb({
                retStatus: "failure",
                message: "Pdf annotation failed : " + util.inspect(err)
            });
        } else {
            if (pdf) {
                console.log('id pdf found',pdf._id)
                pdf.annotations.push(annotationModel);

                pdf.save(function(err) {
                  if(err){
                    console.log('error saving comment',err)
                  }else{
                    cb({
                        retStatus: "success",
                        message: "Annotation saved"
                    });
                  }
                });

            } else {
                cb({
                    retStatus: "failure",
                    message: "Pdf not found"
                });
            }
        }
    });
  }
  ,
  // Remove comment -------------------------------------------------------------------------
  removeAnnotation : function(pdfID, annotationID, authorID, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);

    PdfModel.findByIdAndUpdate(
      pdfID, { $pull: { "annotations": { id: annotationID, authorID: authorID } } }, { safe: true, upsert: true },
      function(err, data) {
        if (err) {
          cb({
              retStatus: "failure",
              message: "Pdf annotation failed : " + util.inspect(err)
          });
        }else{
          cb({
              retStatus: "success",
              message: "Annotation deleted"
          });
        }
    });
  },
  // Get all annotations -------------------------------------------------------------------------
  getAnnotations : function(pdfID, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);

    // find PDF to add new annotations
    PdfModel.findOne({_id: pdfID}, function(err, pdf) {
        if (err) {
            cb({
                retStatus: "failure",
                message: "Pdf annotation failed : " + util.inspect(err)
            });
        } else {
            if (pdf) {
                    cb({
                        retStatus: "success",
                        data: pdf.annotations
                    });
            } else {
                cb({
                    retStatus: "failure",
                    data: {}
                });
            }
        }
    });
  },
  // Get all annotations -------------------------------------------------------------------------
  getPDF : function(pdfID, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);

    // find PDF to add new annotations
    PdfModel.findOne({_id: pdfID}, function(err, pdf) {
        if (err) {
            cb({
                retStatus: "failure",
                message: "Pdf annotation failed : " + util.inspect(err)
            });
        } else {
            if (pdf) {
                    cb({
                        retStatus: "success",
                        data: pdf
                    });
            } else {
                cb({
                    retStatus: "failure",
                    data: {}
                });
            }
        }
    });
  }


};

module.exports = mongoose.model('pdf', PDFSchema);
