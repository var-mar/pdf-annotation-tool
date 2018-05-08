const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');
//const pdfUtils = require('../utils/pdfUtils');


var filterAuthorId = function(json,authorId){
  for(var i=0;i<json.length;i++){
      json[i] = json[i].toObject();
      if(json[i]['authorID'] == authorId){
        json[i]['areYouTheAuthor'] = true;
      }else{
        json[i]['areYouTheAuthor'] = false;
      }
      delete json[i]['authorID'];
  }
  return json;
}

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

// Define the Legend model schema

//COLORS = ['red', 'blue', ...];

function colorValidator (v) {
    if (v.indexOf('#') == 0) {
        if (v.length == 7) {  // #f0f0f0
            return true;
        } else if (v.length == 4) {  // #fff
            return true;
        }
    }
    return false;//COLORS.indexOf(v) > -1;
};

const LegendItemSchema = new Schema({
  name:{
      type:String,
      required:true
  },
  color: {
    type: String,
    validate: [colorValidator, 'not a valid color'],
    required:true
  },
  sortPosition:{
    type:Number,
    required:false
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
    legends:{type:[LegendItemSchema]},
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
    annotationModel.type = info.type;

    // position first annotation in the page
    annotationModel.sortPosition = parseFloat(info.position.pageNumber)+(parseFloat(info.position.boundingRect.y1/info.position.boundingRect.height));

    // Added fields
    annotationModel.authorID = authorID;
    annotationModel.author = author;

    // Find PDF to add new annotations
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
  },

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
  getAnnotations : function(pdfID,userId, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);
    // Find PDF to add new annotations
    PdfModel.findOne({_id: pdfID}, function(err, pdf) {
        if (err) {
            cb({
                retStatus: "failure",
                message: "Pdf annotation failed : " + util.inspect(err)
            });
        } else {
            if (pdf) {
              pdf.annotations = filterAuthorId(pdf.annotations,userId);
              pdf.legends = filterAuthorId(pdf.legends,userId);
              var data = {
                'annotations': pdf.annotations,
                'legends': pdf.legends
              };
              cb({
                retStatus: "success",
                data: data
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

  updateAnnotation: function(pdfID, userId, annotationId,comment, type, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);

    // Find PDF to add new annotations
    PdfModel.findOne({_id: pdfID}, function(err, pdf) {
      pdf.update({ _id: annotationId }, { $set: { 'type': type, 'comment':{'emoji':'','text':comment} }}, function(err){
        if (err) {
          cb({
            retStatus: "failure",
            message: "Pdf annotation failed : " + util.inspect(err)
          });
        } else {
          cb({
            retStatus: "success",
            data: {}
          });
        }
      });
    });
  },

  // Get all annotations -------------------------------------------------------------------------
  getPDF : function(pdfID,userId, cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);
    // Find PDF to add new annotations
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
                        data: filterAuthorId(pdf,userId)
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
  getAllPDF : function(userId ,cb) {
    var PdfModel = mongoose.model('pdf',PDFSchema);
    PdfModel.find({},(err,docs)=>{
      if (err) {
          cb({
              retStatus: "failure",
              message: "Get All Pdf failed : " + util.inspect(err)
          });
      } else {
                    cb({
                      retStatus: "success",
                      data: filterAuthorId(docs,userId)
                    });
      }
    });
  }

};

module.exports = mongoose.model('pdf', PDFSchema);
