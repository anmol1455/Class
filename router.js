const express = require('express');
const router = express.Router();
const db  = require('./dbConnection');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', signupValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: 'This user is already in use!'
        });
      } else {
        // username is available
        
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err
            });
          } else {
            // has hashed pw => add to database
            db.query(
              `INSERT INTO users (name, email, password) VALUES ('${req.body.name}', ${db.escape(
                req.body.email
              )}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err
                  });
                }
                return res.status(201).send({
                  msg: 'The user has been registerd with us!'
                });
              }
            );
          }
        });
      }
    }
  );
});


router.post('/login', loginValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      // user does not exists
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: 'Email or password is incorrect!'
        });
      }
      // check password
      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
          // wrong password
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: 'Email or password is incorrect!'
            });
          }
          if (bResult) {
            const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
            db.query(
              `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
              msg: 'Logged in!',
              token,
              user: result[0]
            });
          }
          return res.status(401).send({
            msg: 'Username or password is incorrect!'
          });
        }
      );
    }
  );
});

router.post('/get-user', signupValidation, (req, res, next) => {


    if(
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') ||
        !req.headers.authorization.split(' ')[1]
    ){
        return res.status(422).json({
            message: "Please provide the token",
        });
    }

    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');

    db.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
    });


});

  // Retrieve all users 
  router.get('/users', function (req, res) {
  db.query('SELECT * FROM users', function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results, message: 'users list.' });
  });
  });
  // Retrieve user with id 
  router.get('/user/:id', function (req, res) {
  let user_id = req.params.id;
  if (!user_id) {
  return res.status(400).send({ error: true, message: 'Please provide user_id' });
  }
  db.query('SELECT * FROM users where id=?', user_id, function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results[0], message: 'users list.' });
  });
  });
  // Add a new user  
  router.post('/user', function (req, res) {
  let user = req.body.user;
  if (!user) {
  return res.status(400).send({ error:true, message: 'Please provide user' });
  }
  db.query("INSERT INTO users SET ? ", { user: user }, function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results, message: 'New user has been created successfully.' });
  });
  });
  //  Update user with id
  router.put('/user', function (req, res) {
  let user_id = req.body.user_id;
  let user = req.body.user;
  if (!user_id || !user) {
  return res.status(400).send({ error: user, message: 'Please provide user and user_id' });
  }
  db.query("UPDATE users SET user = ? WHERE id = ?", [user, user_id], function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results, message: 'user has been updated successfully.' });
  });
  });
  //  Delete user
  router.delete('/user', function (req, res) {
  let user_id = req.body.user_id;
  if (!user_id) {
  return res.status(400).send({ error: true, message: 'Please provide user_id' });
  }
  db.query('DELETE FROM users WHERE id = ?', [user_id], function (error, results, fields) {
  if (error) throw error;
  return res.send({ error: false, data: results, message: 'User has been updated successfully.' });
  });
  }); 
  

  // attendance controller routes
  // ----------------------------
  /**
   * Create a new Attendance record
   */
  router.post('/attendance', function (req, res){
 
  console.log("Retrieve all Attendance records");
   /**
   * Query params 'from: Date' or 'to: Date'  can be given
  */});
  router.get('/attendance', function (req, res){

   console.log("Delete a Attedance record with object id");
      /**
   */
  // app.delete('/attendance/:id', attendance.delete);
  
 
  console.log("Create a multiple Attendance records");
   /**
   */
  });
  router.post('/attendance/multiple', function (req, res){
  
  
   console.log(" Get Attendance report - student count of school, grade, class ");
    /**
   * Query param 'date: Date' can be given
   */
  });
  router.get('/attendance/report', function (req, res){

  });



module.exports = router;
