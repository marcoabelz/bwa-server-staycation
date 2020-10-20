const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const itemSchema = new mongoose.Schema({
    title: {
        type : String,
        required : true
    },
    price: {
        type: Number,
        required: true
    },
    country: {
        type : String,
        default : 'Indonesia'
    },
    city: {
        type: String,
        required: true
    },
    isPopular: {
        type : Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        default: 'night'
    },
    sumBooking: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: ObjectId,
        ref: 'Category'
    },
    imageId: [{
        type: ObjectId,
        ref: 'Image' //agar terhubung dengan model Image
    }],
    featureId: [{
        type: ObjectId,
        ref: 'Feature' //agar terhubung dengan model Feature
    }],
    activityId: [{
        type: ObjectId,
        ref: 'Activity' //agar terhubung dengan model Activity
    }]
})

module.exports = mongoose.model('Item', itemSchema)