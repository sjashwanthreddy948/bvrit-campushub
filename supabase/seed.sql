-- Seed standard engineering & college departments
INSERT INTO departments (id, code, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'CSE', 'Computer Science & Engineering'),
  ('a0000000-0000-0000-0000-000000000002', 'ECE', 'Electronics & Communication Engineering'),
  ('a0000000-0000-0000-0000-000000000003', 'EEE', 'Electrical & Electronics Engineering'),
  ('a0000000-0000-0000-0000-000000000004', 'MECH', 'Mechanical Engineering'),
  ('a0000000-0000-0000-0000-000000000005', 'CIVIL', 'Civil Engineering'),
  ('a0000000-0000-0000-0000-000000000006', 'IT', 'Information Technology'),
  ('a0000000-0000-0000-0000-000000000007', 'AIML', 'Artificial Intelligence & Machine Learning'),
  ('a0000000-0000-0000-0000-000000000008', 'AIDS', 'Artificial Intelligence & Data Science')
ON CONFLICT (code) DO NOTHING;
