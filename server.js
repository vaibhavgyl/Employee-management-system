const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { response } = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'DarmanIsKadikasDad1138()',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);

// Default response for unknown requests
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {});

//actual app runthrough

const intro = ".--------------.\n|              |\n|   EMPLOYEE   |\n|   MANAGER    |\n|              |\n'--------------'";

const menu = [
  {
    type: 'list',
    message: 'What would you like to do?',
    name: 'menuChoice',
    choices: ['Add Employee', 'Add Role', 'Add Department', 'Update Employee Role', 'View All Employees', 'View All Roles', 'View All Departments', 'Quit'],
  },
];

function runMenu() {
  var runMenu = inquirer.prompt(menu);
  runMenu.then((response) => {
    doChoice(response);
  });
};

function addEmployee() {
  var roleArr = [''];
  var mgrArr = [''];
  db.query('SELECT title FROM role;', function (err, results) {
    roleArr.pop();
    for (i = 0; i < results.length; i++) {roleArr.push(results[i].title)};
  });
  db.query('SELECT first_name, last_name FROM employee WHERE role=1;', function (err, results) {
    mgrArr.pop();
    for (i = 0; i < results.length; i++) {mgrArr.push(results[i].first_name + " " + results[i].last_name)};
    mgrArr.push("Employee is a manager");

    var empPrompt = [
      {
        type: 'input',
        message: 'Enter the employees first name:',
        name: 'empFn'
      },
      {
        type: 'input',
        message: 'Enter the employees last name:',
        name: 'empLn'
      },
      {
        type: 'list',
        message: 'Choose employees role:',
        name: 'empRole',
        choices: roleArr
      },
      {
        type: 'list',
        message: 'Choose employees manager:',
        name: 'empMgr',
        choices: mgrArr
      }
    ];
    createEmp = inquirer.prompt(empPrompt);
    createEmp.then((response) => {
      
      db.query(`SELECT id FROM role WHERE title='${response.empRole}';`, function (err, results) {
        var roleid = results[0].id;
        if (response.empMgr != "Employee is a manager") {
          nameArr = response.empMgr.split(' ');
          db.query(`SELECT id FROM employee WHERE first_name='${nameArr[0]}' AND last_name='${nameArr[1]}';`, function (err, results) {
            var mgrid = results[0].id;
            db.query(`INSERT INTO employee (first_name, last_name, role, manager) VALUES ('${response.empFn}', '${response.empLn}', ${roleid}, ${mgrid});`, function (err, results) {
              console.log(`Added ${response.empFn + " " + response.empLn} to the database`);
              runMenu();
            });
          });
        }
        if (response.empMgr == "Employee is a manager") {
          db.query(`INSERT INTO employee (first_name, last_name, role) VALUES ('${response.empFn}', '${response.empLn}', ${roleid});`, function (err, results) {
            console.log(`Added ${response.empFn + " " + response.empLn} to the database`);
            runMenu();
          });
        }
      })
    })
  });
}

function addRole() {
  var deptOptions;
  var deptArr = [''];
  db.query('SELECT name FROM department;', function (err, results) {
    deptOptions = results;
    deptArr.pop();
    for (i = 0; i < deptOptions.length; i++) {deptArr.push(deptOptions[i].name)};
  });
  var rolePrompt = [
    {
      type: 'input',
      message: 'Enter the name of the new role',
      name: 'roleTitle'
    },
    {
      type: 'input',
      message: 'Enter the salary of the new role',
      name: 'roleSalary'
    },
    {
      type: 'list',
      message: 'What department does the new role belong to?',
      name: 'deptChoice',
      choices: deptArr
    }
  ];
  var title;
  var salary;
  var deptName;
  var createRole = inquirer.prompt(rolePrompt);
  createRole.then((response) => {
    title = response.roleTitle;
    salary = response.roleSalary;
    deptName = response.deptChoice;
    console.log(deptName);
  }).then(() => {
    db.query(`SELECT id FROM department WHERE name='${deptName}';`, function (err, results) {
      var deptid = results[0].id;
      db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${title}', ${salary}, ${deptid});`, function (err, results) {
        console.log(`Added ${title} to the database`);
        runMenu();
      })
    })
  }
  );
  
}

function addDepartment() {
  const deptPrompt = [
    {
      type: 'input',
      message: 'Enter the name of the new department',
      name: 'deptName'
    }
  ];
  var createDept = inquirer.prompt(deptPrompt);
  createDept.then((response) => {
    db.query(`INSERT INTO department (name) VALUES ('${response.deptName}');`, function (err, results) {
      console.log(`Added ${response.deptName} to the database`);
      runMenu();
    })
  })
}

function updateEmployeeRole() {
  var roleArr = [''];
  var namesArr = [''];
  db.query('SELECT title FROM role;', function (err, results) {
    roleArr.pop();
    for (i = 0; i < results.length; i++) {roleArr.push(results[i].title)};
    db.query("SELECT first_name, last_name FROM employee;", function (err, results) {
      namesArr.pop();
      for (i = 0; i < results.length; i++) {
        combined = (results[i].first_name + " " + results[i].last_name);
        namesArr.push(combined);
      }
      var roleUpPrompt = [
        {
          type: 'list',
          message: 'Choose employee to change role:',
          name: 'empToChange',
          choices: namesArr
        },
        {
          type:'list',
          message: 'Choose role to change to:',
          name: 'roleToChangeTo',
          choices: roleArr
        }
      ];
      changeRole = inquirer.prompt(roleUpPrompt);
      changeRole.then((response) => {
        empToChangeAsArr = response.empToChange.split(' ');
        db.query(`SELECT id FROM employee WHERE first_name='${empToChangeAsArr[0]}' AND last_name='${empToChangeAsArr[1]}'`, function (err, results) {
          var thatEmpId = results[0].id;
          db.query(`SELECT id FROM role WHERE title='${response.roleToChangeTo}'`, function (err, results) {
            var thatRoleId = results[0].id;
            db.query(`UPDATE employee SET role = ${thatRoleId} WHERE id = ${thatEmpId};`, function (err, results) {
              console.log(`Changed ${empToChangeAsArr[0] + " " + empToChangeAsArr[[1]]}'s role to ${response.roleToChangeTo} in the database`);
              runMenu();
            })
          })
        })
      })
    })

  });
}

function viewEmployees() {
  //retrieve employees
  db.query("SELECT a.id, a.first_name, a.last_name, role.title, department.name AS department, role.salary, concat(b.first_name, ' ', b.last_name) AS manager FROM employee AS a LEFT JOIN employee AS b ON a.manager = b.id JOIN role ON a.role = role.id JOIN department ON role.department_id = department.id;", (err, results) => {
    console.table(results);
    runMenu();
  });
}

function viewDepartments() {
  //retrieve depts
  db.query('SELECT * FROM department;', (err, results) => {
    console.table(results);
    runMenu();
  });
}

function viewRoles() {
  //retrieve roles
  db.query('SELECT * FROM role;', (err, results) => {
    console.table(results);
    runMenu();
  });
}

function doChoice(choice) {
  choice = choice.menuChoice;
  if (choice == 'Add Employee') {addEmployee()};
  if (choice == 'Add Role') {addRole()};
  if (choice == 'Add Department') {addDepartment()};
  if (choice == 'Update Employee Role') {updateEmployeeRole()};
  if (choice == 'View All Employees') {viewEmployees()};
  if (choice == 'View All Roles') {viewRoles()};
  if (choice == 'View All Departments') {viewDepartments()};
  if (choice == 'Quit') {
    console.log("Goodbye!");
    return process.exit(22)
  };
}

function start() {
  console.log(intro);
  var begin = inquirer.prompt(menu);
  begin.then((response) => {
    doChoice(response);
  });
};

start();