const express = require('express');
const router = express.Router();
const db = require('../database/helpers/usersHelper');
const bcrypt = require('bcryptjs');
const responseStatus = require('../config/responseStatuses');
const {
	generateToken,
	protects,
	emptyCheck,
	checkRole,
	whitespaceCheck
} = require('../middleware/authMiddleware');

// const secret = require('./keys').jwtKey;

//Create
//create a new user and session
router.post('/register', emptyCheck, whitespaceCheck, (req, res, next) => {
	const creds = req.body;
	const hash = bcrypt.hashSync(creds.password, 12);
	creds.password = hash;
	db.registerUser(creds)
		.then((user) => {
			const token = generateToken(user);
			 res.status(responseStatus.created).json({
				token,
				id: user.id,
				email: user.email,
				message: 'Registration successful.'
			});
		})
		.catch((err) => {
			//console.log(err);
			next(err);
		});
});

//Login
//login user and create a new user session
router.post('/login', emptyCheck, (req, res, next) => {
	const creds = req.body;
	db.loginUser(creds)
		.then((user) => {
			if (user && bcrypt.compareSync(creds.password, user.password)) {
				const token = generateToken(user);
				return res.status(responseStatus.successful).json({
					token,
					message: 'User logged in successfully.',
					id: user.id,
					email: user.email
				});
			} else {
				next(responseStatus.badCredentials);
			}
		})
		.catch((err) => {
			//console.log(err);
			next(err);
		});
});
//Read
//get all users
router.get('/', protects, checkRole(), (req, res, next) => {
	db.getUsers()
		.then((users) => {
			res
				.status(responseStatus.successful)
				.json({ users, decodedToken: req.decodedToken });
		})
		.catch((err) => {
			//console.log(err);
			next(err);
		});
});

//Read
//get a user by id
router.get('/:id', protects, checkRole(), (req, res, next) => {
	const { id } = req.params;
	db.getUsers(id)
		.then((users) => {
			res
				.status(responseStatus.successful)
				.json({ users, decodedToken: req.decodedToken });
		})
		.catch((err) => {
			if (TypeError) {
				next(responseStatus.notFound);
			} else {
				//console.log(err);
				next(err);
			}
		});
});

//Update
//update a users account
router.put('/:id', emptyCheck, whitespaceCheck, (req, res, next) => {
	const { id } = req.params;
	const user = req.body;

	db.updateUser(id, user)
		.then((count) => {
			if (count === 1) {
				res.status(responseStatus.successful).json({ updatedRecords: count });
			} else {
				next(responseStatus.notFound);
			}
		})
		.catch((err) => {
			//console.log(err);
			next(err);
		});
});

//Delete
//delete a user
router.delete('/:id', (req, res, next) => {
	const { id } = req.params;
	db.deleteUser(id)
		.then((count) => {
			if (count === 1) {
				res.status(responseStatus.successful).json({ deletedRecords: count });
			} else {
				next(responseStatus.notFound);
			}
		})
		.catch((err) => {
			//console.log(err);
			next(err);
		});
});

module.exports = router;
