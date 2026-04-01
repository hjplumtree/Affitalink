function clone(value) {
  return structuredClone(value);
}

function matchesFilters(row, filters) {
  return filters.every((filter) => {
    if (filter.type === "eq") return row[filter.column] === filter.value;
    if (filter.type === "neq") return row[filter.column] !== filter.value;
    return true;
  });
}

function compareValues(left, right, ascending) {
  if (left === right) return 0;
  if (left == null) return ascending ? -1 : 1;
  if (right == null) return ascending ? 1 : -1;
  return left > right ? (ascending ? 1 : -1) : ascending ? -1 : 1;
}

function applyFilters(rows, filters) {
  if (!filters.length) return rows;
  return rows.filter((row) => matchesFilters(row, filters));
}

function applySelect(state, table, options) {
  let rows = applyFilters((state[table] || []).map((row) => clone(row)), options.filters || []);

  if (options.order) {
    const { column, ascending } = options.order;
    rows = rows.sort((left, right) =>
      compareValues(left[column], right[column], ascending)
    );
  }

  if (typeof options.limit === "number") {
    rows = rows.slice(0, options.limit);
  }

  return { data: rows, error: null };
}

function createSelectBuilder(state, table) {
  const options = { order: null, limit: null, filters: [] };
  return {
    eq(column, value) {
      options.filters.push({ type: "eq", column, value });
      return this;
    },
    neq(column, value) {
      options.filters.push({ type: "neq", column, value });
      return this;
    },
    order(column, { ascending = true } = {}) {
      options.order = { column, ascending };
      return this;
    },
    limit(count) {
      options.limit = count;
      return this;
    },
    maybeSingle() {
      const result = applySelect(state, table, options);
      return Promise.resolve({
        data: result.data[0] || null,
        error: null,
      });
    },
    then(resolve, reject) {
      return Promise.resolve(applySelect(state, table, options)).then(resolve, reject);
    },
  };
}

function createDeleteBuilder(state, table) {
  const filters = [];
  return {
    eq(column, value) {
      filters.push({ type: "eq", column, value });
      state[table] = (state[table] || []).filter((row) => !matchesFilters(row, filters));
      return Promise.resolve({ data: null, error: null });
    },
    neq(column, value) {
      filters.push({ type: "neq", column, value });
      state[table] = (state[table] || []).filter((row) => !matchesFilters(row, filters));
      return Promise.resolve({ data: null, error: null });
    },
  };
}

function createUpdateBuilder(state, table, payload) {
  const filters = [];

  const run = () => {
    let updatedRows = [];
    state[table] = (state[table] || []).map((row) => {
      if (!matchesFilters(row, filters)) return row;
      const updated = { ...row, ...clone(payload) };
      updatedRows.push(updated);
      return updated;
    });

    return updatedRows;
  };

  return {
    eq(column, value) {
      filters.push({ type: "eq", column, value });
      return this;
    },
    select() {
      const updatedRows = run();
      return {
        maybeSingle() {
          return Promise.resolve({ data: updatedRows[0] || null, error: null });
        },
        then(resolve, reject) {
          return Promise.resolve({ data: updatedRows, error: null }).then(resolve, reject);
        },
      };
    },
    then(resolve, reject) {
      const updatedRows = run();
      return Promise.resolve({ data: updatedRows, error: null }).then(resolve, reject);
    },
  };
}

function createInsertResult(rows) {
  return {
    select() {
      return {
        maybeSingle() {
          return Promise.resolve({ data: rows[0] || null, error: null });
        },
        then(resolve, reject) {
          return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
        },
      };
    },
    maybeSingle() {
      return Promise.resolve({ data: rows[0] || null, error: null });
    },
    then(resolve, reject) {
      return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
    },
  };
}

function createFakeSupabaseClient(initialState = {}) {
  const state = {
    workspaces: clone(initialState.workspaces || []),
    connectors: clone(initialState.connectors || []),
    sync_runs: clone(initialState.sync_runs || []),
    coupon_snapshots: clone(initialState.coupon_snapshots || []),
    review_items: clone(initialState.review_items || []),
  };

  return {
    from(table) {
      return {
        select() {
          return createSelectBuilder(state, table);
        },
        delete() {
          return createDeleteBuilder(state, table);
        },
        update(payload) {
          return createUpdateBuilder(state, table, payload);
        },
        insert(rows) {
          const nextRows = Array.isArray(rows) ? clone(rows) : [clone(rows)];
          state[table] = (state[table] || []).concat(nextRows);
          return createInsertResult(nextRows);
        },
        upsert(rows, { onConflict = "id" } = {}) {
          const nextRows = Array.isArray(rows) ? clone(rows) : [clone(rows)];
          const currentRows = state[table] || [];

          for (const row of nextRows) {
            const conflictColumns = onConflict.split(",").map((entry) => entry.trim());
            const index = currentRows.findIndex((existing) =>
              conflictColumns.every((column) => existing[column] === row[column])
            );
            if (index >= 0) {
              currentRows[index] = { ...currentRows[index], ...row };
            } else {
              currentRows.push(row);
            }
          }

          state[table] = currentRows;
          return createInsertResult(nextRows);
        },
      };
    },
    dump() {
      return clone(state);
    },
  };
}

module.exports = {
  createFakeSupabaseClient,
};
