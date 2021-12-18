"use strict";
const express = require('express');

const userController = require('./user.controller');
/*  Routing
    ======================================================== */
const router = () => {
    const userRouter = express.Router();

    userRouter.route('/register')
        .post(userController.register);

    userRouter.route('/login')
        .post(userController.login);

    userRouter.route('/updateScore')
        .put(userController.updateScore);


    return userRouter;
};

module.exports = router;