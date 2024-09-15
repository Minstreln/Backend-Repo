const Category = require('../../models/category/categoryModel.js');
const catchAsync = require('../../utils/catchAsync');
const factory = require('../handler/handlerFactory');

// add categories logic
exports.addCategory = catchAsync(async (req, res) => {
    const newCategory = await Category.create({
        categoryName: req.body.categoryName,
    });

    res.status(201).json({
        status: 'success',
        message: 'Category created successfully',
        newCategory,
    });
});

// crud operations for categories
exports.getAllCategory = factory.getAll(Category);

exports.getCategory = factory.getOne(Category);

exports.updateCategory = factory.updateOne(Category);

exports.deleteCategory = factory.deleteOne(Category);
