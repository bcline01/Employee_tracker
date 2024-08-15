
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
        .then(function (answers) {
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
                // case 'update an employee roll':
                //     updateEmployee();
                //     break;
                // case 'Quit':
                //     quitApp();
                //     break;
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
    inquirer.prompt({
        type: 'input',
        name: 'newDeptName',
        message: "please add a department",
    })
        .then(function (answers) {
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
async function addRole() {
    try {
        // Query the department table
        const result = await pool.query('SELECT * FROM department');

        // Map the departments to the format needed for choices
        const deptArray = result.rows.map(department => ({
            name: department.department_name,
            value: department.id
        }));

        console.log('Departments:', deptArray);

        // create prompts for name, salary, and department(id)
        const answers = await inquirer.prompt([
            {
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
        const insertResult = await pool.query(
            `INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)`,
            [answers.newRoleName, answers.newRoleSalary, answers.newDepartment]
        );

        console.table(insertResult.rows);
        questions();

    } catch (err) {
        console.error('Error:', err);
    }
}


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
// create arrays to handle the foreign keys
// create prompts to enter employees first name, last name, role, and manager
async function addEmployee() {
    try {
        // Query roles
        const rolesResult = await pool.query(`SELECT id, title FROM roles`);
        const rolesArray = rolesResult.rows.map(role => ({
            name: role.title,
            value: role.id
        }));

        // Query employees
        const employeesResult = await pool.query(`SELECT id, first_name, last_name FROM employee`);
        const managerArray = employeesResult.rows.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        // Add "None" option to managerArray
        managerArray.push({
            value: null,
            name: 'None'
        });

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'firstNameEmp',
                message: "please add first name",
            },
            {
                type: 'input',
                name: 'lastNameEmp',
                message: "please add last name",
            },
            {
                type: 'list',
                name: 'empRole',
                message: "please add new employees role",
                choices: rolesArray
            },
            {
                type: 'list',
                name: 'empManager',
                message: "please add the employees manager",
                choices: managerArray
            },
          
        ])
        const result = await pool.query(
            `INSERT INTO employee (first_name, last_name, roles_id, manager_id) VALUES ($1, $2, $3, $4)`,
            [answers.firstNameEmp, answers.lastNameEmp, answers.empRole, answers.empManager]
        );

        console.table(result.rows);
        questions();

    } catch (err) {
        console.error('Error:', err);
    }
}





