const express = require('express');
const categoryController = require('../../controllers/category/categoryController');
const adminAuthController = require('../../controllers/admin/adminAuthController');

const Router = express.Router();

// Enpoint to add category
Router.post('/add-category', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    categoryController.addCategory
);

// Enpoint to get all category details
Router.get('/get-all-categories', categoryController.getAllCategory);

//get single, update and delete categories route
Router.route('/:id')
  .get(
    categoryController.getCategory
    )
  .patch(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = Router;
