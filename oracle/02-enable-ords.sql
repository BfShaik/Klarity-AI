-- Run as ADMIN to enable SQL Worksheet / Database Actions for klarity_app.
-- Required for "Invalid credentials" when logging in as klarity_app in Oracle Cloud Console.

BEGIN
  ORDS_ADMIN.ENABLE_SCHEMA(p_schema => 'KLARITY_APP');
END;
/
