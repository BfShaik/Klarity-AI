-- Run as ADMIN to create app user.
-- Use: node scripts/oracle-setup.mjs
-- Or SQL*Plus: sqlplus admin/BabaLeander@2025@'(description=...)' @01-create-user.sql

CREATE USER klarity_app IDENTIFIED BY "KlarityApp2025!";
GRANT CONNECT TO klarity_app;
GRANT RESOURCE TO klarity_app;
GRANT CREATE VIEW TO klarity_app;
GRANT UNLIMITED TABLESPACE TO klarity_app;
