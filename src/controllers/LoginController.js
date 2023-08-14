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
            console.log(user.role);
            /*res.json({ message: 'Login successful'});*/
            
            req.session.loggedin =  true;
            req.session.name = user.name;
            req.session.age = user.age;
            req.session.salary = user.salary;
            

            if(user.role=='1'){
                req.session.role1 = true;
                req.session.role2 = false;
                req.session.role3 = false;
            }else if (user.role=='2') {
                req.session.role1 = false;
                req.session.role2 = true;
                req.session.role3 = false;
            } else if(user.role=='3') {
                req.session.role1 = false;
                req.session.role2 = false;
                req.session.role3 = true;
            }
            
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
                            req.session.role = data.role;

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
    res.render('login/credito.hbs', { name: req.session.name, age: req.session.age, salary: req.session.salary, role: req.session.role });
    
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
    const maxRepayment = parseFloat(salary*.4);
    const Acceptation = false;
    console.log(maxRepayment);
    console.log(monthlyInstallment);
    if((maxRepayment) >= (monthlyInstallment)){
        const Acceptation = true;
        console.log('Si entra a esta mamada');
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
            monthlyInstallment: monthlyInstallment,
            role: req.session.role
        });
    }else{
        res.render('login/credito',{error: 'No se puede solicitar el credito'});
    }

    
}

function solicitar(req, res) {
    const data = req.body;

    const { loanAmount, loanDuration } = req.body;
    const salary = parseFloat(req.session.salary);
    const age = parseInt(req.session.age);

    // Convert loanAmount and totalInterest to floating-point numbers
    const loanAmountFloat = parseFloat(loanAmount);
    const totalInterest = loanAmountFloat * 0.01 * loanDuration;
    const totalRepayment = loanAmountFloat + totalInterest;
    const monthlyInstallment = totalRepayment / loanDuration;
    const maxRepayment = parseFloat(salary * 0.4);

    req.getConnection((err, conn) => {
        if (err) {
            // Handle error
            console.error(err);
            return;
        }

        conn.query('SELECT * FROM creditos WHERE email = ?', [data.Email], (err, userdata) => {
            if (err) {
                // Handle error
                console.error(err);
                return;
            }

            if (userdata.length > 0) {
                const creditData = {
                    email: data.Email,
                    loanDuration: loanDuration,
                    monthlyInstallment: monthlyInstallment,
                    loanAmount: loanAmountFloat,
                    interestRate: 0.01,
                    totalInterest: totalInterest
                };
                console.log(creditData);
                conn.query('INSERT INTO creditos SET ?', [creditData], (err, rows) => {
                    if (err) {
                        // Handle error
                        console.error(err);
                        return;
                    }

                    res.redirect('/');
                });
            } else {
                res.render('login/credito', { error: 'Error al solicitar credito' });
            }
        });
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
    solicitar,
}