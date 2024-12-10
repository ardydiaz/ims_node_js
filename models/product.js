const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    product_code: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_description: {
        type: String,
        required: true
    },
    product_image: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    }
});
module.exports = mongoose.model('product', productSchema);
