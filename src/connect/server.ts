
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';

await connectToDb();

// write beginning question with a list of options to get started

function questions() {
    inquirer.prompt({
            type: 'list',
            message: "What would you like to do?",
            name: 'menu',
            choices: ['view all departments', 
                'view all roles', 
                'view all employees', 
                'add a department', 
                'add a role', 
                'add an employee', 
                'update an employee role',
                'quit']
        })
        .then(function(answers) {
            switch (answers.menu) {
                case 'view all departments':
                    viewAllDepartments();
                    break;
                case 'view all roles':
                    viewAllRoles();
                    break;
                case 'view all employees':
                    viewAllEmployees();
                    break;
                case 'add a department':
                    addDepartment();
                    break;
                case 'add a roll':
                    addRole();
                    break;
                case 'add an employee':
                    addEmployee();
                    break;
                case 'update an employee roll':
                    updateEmployee();
                    break;
                case 'Quit':
                    quitApp();
                    break;
                default:
                    console.log('not a valid choice')
            }
        })
    };

    // working with department first
    // see all departments in the table 
function viewAllDepartments() {
    pool.query(`SELECT * FROM department`, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            questions();
        }
    })
};

// add a department
// need to create an inquirer input for client to add a department
// use addDepartment funciton
function addDepartment() {
inquirer.prompt ({
    type: 'input',
    name: 'newDeptName',
    message: "please add a department",
})
.then(function(answers) {
    pool.query(`INSERT INTO department VALUES ('${answers.newDeptName}');`, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            questions();
        }
    })
})
};

// working on roles
// SELECT * ROLES from roles table
function viewAllRoles() {
    pool.query(`SELECT * FROM roles`, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            questions();
        }
    })
};

// add a role using addRole() function
// department id is a foreign key 
// need to break down id and name off of department to we can connect the ids from roles and department
function addRole() {
    pool.query(`SELECT * FROM department`, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
            return;
        }
        const deptArray = result.rows.map(department => ({
            department_name: department.department_name,
            value: department.id
        }));
// create prompts for name, salary, and department(id)
    inquirer.prompt ([{
        type: 'input',
        name: 'newRoleName',
        message: "please add a role",
    },
    {
        type: 'input',
        name: 'newRoleSalary',
        message: "please add a salary(number)",
    },
    {
        type: 'list',
        name: 'newDepartment',
        message: "which department does the new role belong to?",
        choices: deptArray
    }
])
    .then((answers) => {
        pool.query(`INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)`,[answers.newRoleName, answers.newRoleSalary, answers.newDepartment],(err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
            } else if (result) {
                console.table(result.rows);
                questions();
            }
        })
    })
    })};


    // working on employees
    // view all employees using SELECT * FROM employee table
    function viewAllEmployees() {
        pool.query(`SELECT * FROM employee`, (err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
            } else if (result) {
                console.table(result.rows);
                questions();
            }
        })
    };

    // add an employee using addEmployee() function
    function addEmployee() {
    inquirer.prompt ({
        type: 'input',
        name: 'newEmployee',
        message: "please add an Employee",
    })
    .then(function(answers) {
        pool.query(`INSERT INTO employee VALUES ('${answers.newEmployee}');`, (err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
            } else if (result) {
                console.table(result.rows);
                addEmployee();
            }
        })
    })
    };


  













// Create a movie
// app.post('/api/new-movie', (req, res) => {

// });

// Read all movies
// app.get('/api/movies', (_req, res) => {
 
// });

// Delete a movie
// app.delete('/api/movie/:id', (req, res) => {
 
// });

// Read list of all reviews and associated movie name using LEFT JOIN
// app.get('/api/movie-reviews', (_req, res) => {
  
// });

// BONUS: Update review
// app.put('/api/review/:id', (req, res) => {
 
// });


  