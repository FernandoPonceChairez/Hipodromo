const bcrypt = require('bcrypt');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const config = require('../config');

const connection = mysql.createConnection(config.database);

connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database:', error);
      return;
    }
    console.log('Connected to the database!');
  });

function login(req, res){
    if(req.session.loggedin != true){
        res.render('login/index');
    } else {
        res.redirect('/');
    }
}

function auth (req, res) {
    const { Email, Password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [Email], (error, results) => {

    if (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('An error occurred during authentication');
    return;
    }

    if (results.length === 0) {
    res.status(401).send('Invalid email or password');
    return;
    }

    const user = results[0];

    bcrypt.compare(Password, user.password)
    .then((result) => {
        if (result) {
            console.log(user.name);
            console.log(user.age);
            /*res.json({ message: 'Login successful'});*/
            
            req.session.loggedin =  true;
            req.session.name = user.name;
            req.session.age = user.age;
            req.session.salary = user.salary;
            
            res.redirect('/');
        // Include the username in the response
        } else {
            res.render('login/index',{error: 'Error: incorrect password!'});
        }
    })
    .catch((err) => {
        console.error('Error comparing passwords:', err);
        res.status(500).send('An error occurred during authentication');
    });
});
}


function register(req, res){
    if(req.session.loggedin != true){
        res.render('login/register');
    } else {
        res.redirect('/');
    }
}

function storeUser(req, res){
    const data = req.body;

    req.getConnection((err, conn)=>{
        conn.query('SELECT * FROM users WHERE email = ?',[data.Email],(err, userdata)=>{
            if(userdata.length > 0){
                res.render('login/register', {error: 'Error: user alredy exists!'});
            }else{

                bcrypt.hash(data.Password,10, (err, hash) => {
                    data.Password = hash;
                    req.getConnection((err, conn)=>{
                        conn.query('INSERT INTO users SET ?', [data], (err, rows)=>{

                            req.session.loggedin =  true;
                            req.session.name = data.name;
                            req.session.age = data.age;
                            req.session.salary = data.salary;

                            res.redirect('/');
                        });
                    });
                });

            }
        });
    });

}

function logout(req, res){
    if(req.session.loggedin == true){
        req.session.destroy();
    } 
    res.redirect('/login');
    
}

function credito(req, res){
    if(req.session.loggedin != true){
        res.redirect('/login');
    }
    res.render('login/credito.hbs', { name: req.session.name, age: req.session.age, salary: req.session.salary });
    
}

function loanEstimate(req, res) {
    const { loanAmount, loanDuration } = req.body;
    const salary = parseFloat(req.session.salary);
    const age = parseInt(req.session.age);

    // Convert loanAmount and totalInterest to floating-point numbers
    const loanAmountFloat = parseFloat(loanAmount);
    const totalInterest = loanAmountFloat * 0.01 * loanDuration;
    const totalRepayment = loanAmountFloat + totalInterest;
    const monthlyInstallment = totalRepayment / loanDuration;

    res.render('login/loan_estimation', {
        name: req.session.name,
        age: age,
        salary: salary,
        loanAmount: loanAmountFloat,
        loanDuration: loanDuration,
        interestRate: 0.01,
        interestRatePercentage: 0.01 * 100,
        totalInterest: totalInterest,
        totalRepayment: totalRepayment,
        monthlyInstallment: monthlyInstallment
    });
}


module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout,
    credito,
    loanEstimate,
}