
DO $$

BEGIN

INSERT INTO department (department_name)
VALUES 
('Cardiology'),
('Neurology'),
('Oncology'),
('Pediatrics'),
('Neonatology');
   


INSERT INTO roles (title, salary, department_id)
VALUES 
('Doctor', 200000, 4),
('Physician Assistant', 150000, 3),
('Registered Nurse', 75000, 5),
('Pharmacists', 100000, 1),
('Nurse Practitioner', 120000, 4),
('Physical Therapists', 90000, 3),
('Occupational Therapists', 80000, 2),
('Certified Nursing Assistant', 30000, 1),
('Dietitian', 95000, 5),
('Surgeon', 250000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Emma', 'Carter', 1, 001),
('Liam', 'Sullivan', 1, 002),
('Jackson', 'Lee', 2, NULL),
('Ethan', 'Brown', 2, NULL),
('Noah', 'Mitchell', 3, 005),
('Olivia', 'Davis', 3, 006),
('Mason', 'Clark', 4, NULL),
('James', 'Thompson', 4, NULL),
('Lucas', 'Adams', 5, 009),
('Mia', 'Walker', 5, 010);

RAISE NOTICE 'Transaction complete';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'An error occurred: %', SQLERRM; 
        ROLLBACK; 
END $$;