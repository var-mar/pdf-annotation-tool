const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const util = require('util');

COLORS = ['red', 'blue', ...];

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
    required:true
  }
});

const LegendSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
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
    items: {type: [LegendItemSchema]},
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

module.exports = mongoose.model('legend', LegendSchema);
