const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/db');
const e = require('express');

//register new user
router.post('/register', async (req, res) => {
    console.log('Registration received:', req.body);

    try {
        const { username, email, password } = req.body;

        // basic validations
        if (!username || !email || !password) {
            console.log('Error:Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // check if user already exists
        console.log('Checking if user already exists');
        const userExists = await db.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        if (userExists.rows.length > 0) {
            console.log('Error:User already exists');
            return res.status(400).json({
                success: false,
                message: 'Username or email is already registered'
            });
        }

        // hash password
        console.log('Generating password hash...');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // insert new user into database
        console.log('Inserting new user into database...');
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, passwordHash]
        );

        console.log('User registered successfully', result.rows[0]);
        res.json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (err) {
        console.error('Detailed registration error', {
            error: err.message,
            code: err.code,
            detail: err.detail,
            table: err.table,
            constraint: err.constraint
        });

        // handle specific errors
        if (err.code === '23505') {
            console.log('Error:User already exists');
            return res.status(400).json({
                success: false,
                message: 'Username or email is already registered'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error registering user. Please try again'
            });
        }
    }
});

module.exports = router;