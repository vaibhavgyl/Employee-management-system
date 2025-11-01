INSERT INTO department (name)
VALUES  ("Management"),
        ("Web Development");

INSERT INTO role (title, salary, department_id)
VALUES  ("Manager", 120000, 1),
        ("Web Developer - Front End", 100000, 2),
        ("Web Developer - Back End", 100000, 2);

INSERT INTO employee (first_name, last_name, role, manager)
VALUES  ("The", "Batman", 1, NULL),
        ("Maki", "Saloma", 3, 1),
        ("Steve", "Hart", 2, 1);