
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
            'view employees by manager',
            'view employees by department',
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
                case 'view employees by manager':
                    empByManager();
                    break;
                case 'view employees by department':
                    empByDepartment();
                    break;
                case 'add a department':
                    addDepartment();
                    break;
                case 'add a role':
                    addRole();
                    break;
                case 'add an employee':
                    addEmployee();
                    break;
                case 'update an employee role':
                    updateEmployeeRole();
                    break;
                case 'quit':
                    quitApp();
                    break;
                default:
                    console.log('not a valid choice')
            }
        })
};

// working with department first
// see all departments in the table 
// formatted table showing department names and department ids
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
        message: "What is the name of the department you would like to add?",
    })
        .then((answers) => {
            const departmentName = answers.newDeptName;
            pool.query(`INSERT INTO department (department_name) VALUES ($1) RETURNING *;`, [departmentName], (err: Error, result: QueryResult) => {
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
// job title, role id, the department that role belongs to, and the salary for that role
function viewAllRoles() {
    const sql = `SELECT roles.title AS job_title, roles.id AS role_id, roles.salary, department.department_name AS department_name FROM roles INNER JOIN department ON roles.department_id = department.id`
    pool.query(sql, (err: Error, result: QueryResult) => {
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
// enter the title, salary, and department for the role and that role is added to the database

async function addRole() {
    try {
        
        const departmentResult = await pool.query(`SELECT id, department_name FROM department`);
        const departmentArray = departmentResult.rows.map(department => ({
            name: department.department_name,
            value: department.id
        }));

        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: "please add job title",
            },
            {
                type: 'input',
                name: 'salary',
                message: "please add new salary(number)",
            },
            {
                type: 'list',
                name: 'department',
                message: "please add new department:",
                choices: departmentArray
            },
          
          
        ])
        const result = await pool.query(
            `INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *;`,
            [answers.title, answers.salary, answers.department]
        );

        console.table(result.rows);
        questions();

    } catch (err) {
        console.error('Error:', err);
    }

};

// working on employees
//  including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
function viewAllEmployees() {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, roles.title AS job_title, department.department_name, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id ORDER BY employee.id;`
    pool.query(sql, (err: Error, result: QueryResult) => {
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
            `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *;`,
            [answers.firstNameEmp, answers.lastNameEmp, answers.empRole, answers.empManager]
        );

        console.table(result.rows);
        questions();

    } catch (err) {
        console.error('Error:', err);
    }

}

// update employee using updateEmployee()
// I am prompted to select an employee to update and their new role and this information is updated in the database

async function updateEmployeeRole() {
    try {
        // First fetch all employees so the user can choose which one needs to be updated
        const employeeResult = await pool.query(`SELECT id, first_name, last_name FROM employee`);

        // make it into an arry so it can be used in inquirer prompt
        const employeeArray = employeeResult.rows.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
        }));

        // Fetch all roles (id needs to be included- foreign key!)
        const rolesResult = await pool.query(`SELECT id, title FROM roles`);

        const rolesArray = rolesResult.rows.map(roles => ({
            name: roles.title,
            value: roles.id
        }));

        // Prompt the user to select an employee and a new role
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Select the employee you want to update:',
                choices: employeeArray
            },
            {
                type: 'list',
                name: 'roleId',
                message: 'Select the new role for the employee:',
                choices: rolesArray
            }
        ]);

        // Execute the UPDATE query to change the employee's role by connecting the foreign key (id) then return all (*) and call them
        const result = await pool.query(
            `UPDATE employee 
             SET role_id = $1 
             WHERE id = $2 
             RETURNING *;`,
            [answers.roleId, answers.employeeId]
        );

        console.table(result.rows);
        questions();

    } catch (err) {
        console.error('Error:', err);
    }

}


// BONUS: view employees by manager
function empByManager() {
    const sql = `SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, COALESCE(CONCAT(manager.first_name, ' ', manager.last_name), 'No Manager') AS Manager FROM employee LEFT JOIN employee AS manager ON employee.manager_id = manager.id ORDER BY Manager, Employee;`
    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            questions();
        }
    })
};

// BONUS: view employees by department
function empByDepartment() {
    const sql = `SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS Employee, department.department_name AS Department FROM employee LEFT JOIN roles ON employee.role_id = roles.id LEFT JOIN department ON roles.department_id = department.id ORDER BY Department, Employee;`
    pool.query(sql, (err: Error, result: QueryResult) => {
        if (err) {
            console.log(err);
        } else if (result) {
            console.table(result.rows);
            questions();
        }
    })
};




// quit out of app using quitApp()
function quitApp() {
    console.log('Goodbye!');
    process.exit();  
};



questions();





