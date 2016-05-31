var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var codeSchema = new Schema({
    code: {type:String, required:true, unique:true},
    isUsed: Boolean,
    type  : {type:Number, default: 0},
    flow  : Number,
    time  : Number,
    createTime: {type:Date, default: new Date()},
    useTime: Date,
    userName: String
});

var Code = mongoose.model('Code', codeSchema);