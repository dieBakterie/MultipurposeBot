// src/utils/databaseUtils.js
/**
 * @module dbUtils
 * @description Helper functions for interacting with the Postgres database.
 */

// *** Imports ***
import { query } from '../database/database.js';
import { logAndThrowError } from './helpers.js';
import logger from '../logger.js';
import { nodeEnvironment } from '../alias.js';

// *** Functions ***

function validateParameters(params) {
  if (!params || typeof params !== 'object') {
    throw new Error('Ungültige Parameter. Erwartet wird ein Objekt.');
  }
}

/**
 * Generates placeholders for columns and values in a SQL query.
 * @param {object} columns - The columns and values for the query.
 * @param {number} index - The starting index for the placeholders.
 * @returns {object} An object containing the column names and placeholders.
 */
function generateColumnPlaceholders(columns, index) {
  const placeholders = Object.keys(columns).map((_, i) => `$${index + i}`);
  return {
    cols: Object.keys(columns),
    vals: placeholders,
  };
}

/**
 * Executes a generic SQL query with parameters.
 * @example
 * // SELECT example
 * const result = await executeQuery('SELECT', 'users', {}, { id: 1 });
 * 
 * @example
 * // INSERT example
 * const result = await executeQuery('INSERT', 'users', { name: 'John', age: 30 });
 * 
 * @example
 * // UPDATE example
 * const result = await executeQuery('UPDATE', 'users', { name: 'John Doe' }, { id: 1 });
 * 
 * @example
 * // DELETE example
 * const result = await executeQuery('DELETE', 'users', {}, { id: 1 });
 * 
 * @param {string} operation - The SQL operation (e.g., 'SELECT', 'INSERT', 'UPDATE', 'DELETE').
 * @param {string} table - The table name.
 * @param {object} [columns={}] - The columns and values for the operation.
 * @param {object} [conditions={}] - The conditions for the query.
 * @param {object} [conflict={}] - Conflict handling options.
 * @param {boolean} [forUpdate=false] - Whether to lock the selected rows for update.
 * @returns {Promise<{ success: boolean, query: string, params: any[], rows: any[], rowCount: number }>}
 */
export async function executeQuery(operation, table, columns = {}, conditions = {}, conflict = {}, forUpdate = false) {
  validateParameters(columns);
  validateParameters(conditions);

  let sql = `${operation} INTO ${table}`;
  const params = [];
  let index = 1;

  if (operation === 'SELECT') {
    sql = `${operation} ${Object.keys(columns || {}).join(', ') || '*'} FROM ${table}`;
  }

  if (operation === 'INSERT' || operation === 'UPDATE') {
    const result = applyColumns(sql, columns, index, params, operation);
    sql = result.sql;
    params = result.params;
    index = result.index;
  }

  if (operation === 'DELETE') {
    sql = `DELETE FROM ${table}`;
  }

  if (Object.keys(conditions || {}).length > 0) {
    const result = applyConditions(sql, conditions, index, params);
    sql = result.sql;
    params = result.params;
    index = result.index;
  }

  if (operation === 'INSERT' && conflict.target && conflict.action) {
    sql += ` ON CONFLICT (${conflict.target}) DO ${conflict.action}`;
  }

  if (forUpdate && operation === 'SELECT') {
    sql += ' FOR UPDATE';
  }

  if (nodeEnvironment === "development") {
    const start = Date.now();
    logger.debug("SQL Query Details:", { operation, table, query: sql, params });
    logger.debug(`Query duration: ${Date.now() - start}ms`);
  }

  try {
    return {
      success: true,
      query: sql,
      params,
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
      table,
      operation,
      duration: Date.now() - start || 0,
    };
  } catch (error) {
    handleDatabaseError(error, `Fehler bei ${operation} in Tabelle ${table}`, '⚠️', { sql, params, table, operation });
  }
}

function applyConditions(sql, conditions, index, params) {
  if (!Object.keys(conditions || {}).length) return { sql, params, index };

  const conds = buildConditions(conditions, index);
  params.push(...Object.values(conditions).map(val => val.value || val));
  sql += ` WHERE ${conds}`;

  return { sql, params, index: index + Object.keys(conditions).length };
}

function applyColumns(sql, columns, index, params, operation) {
  if (!Object.keys(columns || {}).length) return { sql, params, index };

  const { cols, vals } = generateColumnPlaceholders(columns, index);
  params.push(...Object.values(columns));

  if (operation === 'INSERT') {
    sql += ` (${cols.join(', ')}) VALUES (${vals.join(', ')})`;
  } else if (operation === 'UPDATE') {
    const updates = cols.map((col, i) => `${col} = ${vals[i]}`).join(', ');
    sql += ` SET ${updates}`;
  }

  return { sql, params, index: index + cols.length };
}

export async function selectFromTable(table, conditions = {}, columns = ['*']) {
  return executeQuery('SELECT', table, Object.fromEntries(columns.map(col => [col, true])), conditions, {}, false);
}

export async function insertIntoTable(table, columns) {
  return executeQuery('INSERT', table, columns, {}, {}, false);
}

/**
 * Builds conditions for a SQL query.
 * @param {object} conditions - The conditions for the query.
 * @param {number} index - The starting index for the placeholders.
 * @returns {string[]} An array of conditions for the query.
 */
function buildConditions(conditions, index) {
  return Object.entries(conditions)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        const { operator = '=', value: condValue, join = 'AND' } = value;
        if (Array.isArray(condValue)) {
          const placeholders = condValue.map(() => `$${index++}`).join(', ');
          return `(${key} ${operator} (${placeholders})) ${join}`;
        }
        return `(${key} ${operator} $${index++}) ${join}`;
      }
      return `${key} = $${index++}`;
    })
    .join(' ')
    .replace(/ AND$/, '') // Entfernt das letzte 'AND', wenn keine weiteren Bedingungen folgen
    .replace(/ OR$/, ''); // Entfernt das letzte 'OR', wenn keine weiteren Bedingungen folgen
}

/**
 * Builds a conflict strategy for a PostgreSQL UPSERT statement.
 * @param {string|string[]} target - The column(s) to check for conflicts.
 * @param {Object<string, any>} updates - The columns to update in case of a conflict.
 * @param {string} [customConditions=''] - Additional conditions to apply when updating the row.
 * @returns {Object} A conflict strategy object for the UPSERT statement.
 */
export function buildConflictStrategy(target, updates, customConditions = '') {
  if (!target || (Array.isArray(target) && !target.length)) {
    throw new Error('Ein Konfliktziel muss angegeben werden.');
  }

  if (!updates || !Object.keys(updates).length) {
    throw new Error('Updates müssen mindestens eine Spalte enthalten.');
  }

  const updateSet = Object.keys(updates)
    .map((key) => `${key} = EXCLUDED.${key}`)
    .join(', ');

  return {
    target: Array.isArray(target) ? target.join(', ') : target,
    action: `UPDATE SET ${updateSet} ${customConditions ? `WHERE ${customConditions}` : ''}`.trim(),
  };
}

/**
 * Handles a database error and logs it with a suitable error message.
 * @param {Error} error - The error object thrown by the database.
 * @param {string} contextMessage - The context where the error occurred.
 * @param {string} emoji - The emoji to use for the log message.
 * @param {Object} [queryInfo={}] - Additional information about the query.
 * @returns {void} - Does not return anything.
 */
export function handleDatabaseError(error, contextMessage, emoji, queryInfo = {}) {
  const errorMessage = `${emoji} Fehler bei ${contextMessage}: ${error.message || 'Unbekannter Fehler'}`;
  
  console.error(errorMessage, {
    query: queryInfo.sql || '',
    params: queryInfo.params || [],
    stack: error.stack || 'Kein Stack verfügbar',
    table: queryInfo.table || 'Unbekannt',
    operation: queryInfo.operation || 'Unbekannt',
  });

  if (nodeEnvironment === "production") {
    logger.error({
      message: errorMessage,
      error: error.message,
      query: queryInfo.sql,
      params: queryInfo.params,
      stack: error.stack,
      table: queryInfo.table,
      operation: queryInfo.operation,
    });
  }

  logAndThrowError(emoji, errorMessage);
}
