import { randomUUID } from "crypto";
import { execute, query } from "../db";

export async function getCustomersByUser(userId: string) {
  return query<{ id: string; name: string }>(
    `SELECT id, name FROM customers WHERE user_id = :userId ORDER BY name`,
    { userId }
  );
}

export async function searchCustomers(userId: string, pattern: string, limit = 5) {
  const p = `%${pattern}%`;
  return query<{ id: string; name: string; notes: string | null }>(
    `SELECT id, name, notes FROM customers WHERE user_id = :userId
     AND (UPPER(name) LIKE UPPER(:p) OR UPPER(NVL(notes, '')) LIKE UPPER(:p))
     FETCH FIRST :limit ROWS ONLY`,
    { userId, p, limit }
  );
}

export async function getCustomersByUserWithNotes(userId: string) {
  return query<{ id: string; name: string; notes: string | null }>(
    `SELECT id, name, notes FROM customers WHERE user_id = :userId ORDER BY name`,
    { userId }
  );
}

export async function insertCustomer(userId: string, data: { name: string; notes?: string | null }) {
  const id = randomUUID();
  await execute(
    `INSERT INTO customers (id, user_id, name, notes) VALUES (:id, :userId, :name, :notes)`,
    { id, userId, name: data.name.trim(), notes: data.notes ?? null },
    { autoCommit: true }
  );
  return { id, name: data.name, notes: data.notes ?? null };
}

export async function updateCustomer(id: string, userId: string, data: { name: string; notes?: string | null }) {
  return execute(
    `UPDATE customers SET name = :name, notes = :notes, updated_at = CURRENT_TIMESTAMP WHERE id = :id AND user_id = :userId`,
    { id, userId, name: data.name.trim(), notes: data.notes ?? null },
    { autoCommit: true }
  );
}

export async function deleteCustomer(id: string, userId: string) {
  return execute(
    `DELETE FROM customers WHERE id = :id AND user_id = :userId`,
    { id, userId },
    { autoCommit: true }
  );
}
