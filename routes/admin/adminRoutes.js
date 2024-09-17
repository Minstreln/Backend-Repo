const express = require('express');
const adminAuthController = require('../../controllers/admin/adminAuthController');
const adminController = require('../../controllers/admin/adminController');

const Router = express.Router();

// admin register endpoint
// Router.post('/signup',
//     adminAuthController.uploadAdminPhoto,
//     adminAuthController.resizeAdminPhoto,
//     adminAuthController.adminRegister
// );

// admin login endpoint
Router.post('/signin', adminAuthController.adminLogin);

// admin logout endpoint
Router.get('/logout', adminAuthController.adminLogout);

// admin forgot password endpoint
Router.post('/forgot-password', adminAuthController.adminForgotPassword);

// admin update password endpoint
Router.patch('/update-password', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminAuthController.adminUpdatePassword
);

// admin update me endpoint (for updating the details of the admin)
Router.patch('/update-me', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.uploadAdminPhoto,
    adminController.resizeAdminPhoto,
    adminController.AdminUpdateMe
);

// Get all jobseekers endpoint
Router.get('/all-jobseekers', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.getAllJobseeker
);

// Get all jobseekers endpoint
Router.get('/all-recruiters', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.getAllRecruiter
);

//////////////////////////////// GENERIC ROUTES ////////////////////////////////

// admin reset password endpoint
Router.patch('/reset-password/:token', adminAuthController.adminResetPassword);

// Get single, and delete jobseeker endpoint
Router.route('/:id')
  .get(adminController.getJobseeker)
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.deleteJobseeker
  );

// Get single, and delete recruiter endpoint
Router.route('/:id')
  .get(adminController.getRecruiter)
  .delete(
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.deleteRecruiter
  );

// ban user
Router.patch('/ban/:id',
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.banUser,
);

// unban user
Router.patch('/unban/:id',
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.unBanUser,
);

// suspend user
Router.patch('/suspend/:id', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.suspendUser,
);

// unsuspend user
Router.patch('/unsuspend/:id', 
    adminAuthController.protect,
    adminAuthController.restrictTo('admin'),
    adminController.unsuspendUser,
);

module.exports = Router;
