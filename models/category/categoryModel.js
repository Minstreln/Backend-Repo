const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: [true, 'Enter the name of the category'],
        trim: true,
        unique: true
    },
    }, {
    timestamps: true, 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
