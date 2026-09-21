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
    advertiser_selections: clone(initialState.advertiser_selections || []),
    sync_runs: clone(initialState.sync_runs || []),
    coupon_snapshots: clone(initialState.coupon_snapshots || []),
  };

  return {
    rpc(name, args) {
      if (name === "save_connector") {
        const connector = clone(args.connector);
        const advertisers = clone(args.advertisers || []);
        if (new Set(advertisers.map((advertiser) => advertiser.id)).size !== advertisers.length) {
          return Promise.resolve({ data: null, error: { message: "duplicate advertiser id" } });
        }
        const index = state.connectors.findIndex((entry) => entry.id === connector.id);
        if (index >= 0) state.connectors[index] = { ...state.connectors[index], ...connector };
        else state.connectors.push(connector);
        state.advertiser_selections = state.advertiser_selections
          .filter((selection) => selection.connector_id !== connector.id)
          .concat(advertisers.map((advertiser) => ({
            workspace_id: connector.workspace_id,
            connector_id: connector.id,
            network: connector.network,
            advertiser_id: advertiser.id,
            advertiser_name: advertiser.name,
            selected: advertiser.selected,
          })));
        return Promise.resolve({ data: [clone(connector)], error: null });
      }

      if (name === "replace_advertiser_selections") {
        const connector = state.connectors.find((entry) =>
          entry.id === args.target_connector_id &&
          entry.workspace_id === args.target_workspace_id &&
          entry.network === args.target_network
        );
        if (!connector) {
          return Promise.resolve({ data: null, error: { message: "connector does not belong to this workspace" } });
        }
        const advertisers = clone(args.advertisers || []);
        if (new Set(advertisers.map((advertiser) => advertiser.id)).size !== advertisers.length) {
          return Promise.resolve({ data: null, error: { message: "duplicate advertiser id" } });
        }
        state.advertiser_selections = state.advertiser_selections
          .filter((selection) => selection.connector_id !== args.target_connector_id)
          .concat(advertisers.map((advertiser) => ({
            workspace_id: args.target_workspace_id,
            connector_id: args.target_connector_id,
            network: args.target_network,
            advertiser_id: advertiser.id,
            advertiser_name: advertiser.name,
            selected: advertiser.selected,
          })));
        return Promise.resolve({ data: null, error: null });
      }

      if (name === "save_sync_result") {
        const syncRun = clone(args.sync_run);
        const connectorIndex = state.connectors.findIndex((entry) =>
          entry.id === syncRun.connector_id &&
          entry.workspace_id === syncRun.workspace_id &&
          entry.network === syncRun.network
        );
        if (connectorIndex < 0) {
          return Promise.resolve({ data: null, error: { message: "connector does not belong to this workspace" } });
        }
        for (const coupon of clone(args.coupons || [])) {
          const couponIndex = state.coupon_snapshots.findIndex((entry) =>
            entry.connector_id === coupon.connector_id && entry.logical_key === coupon.logical_key
          );
          if (couponIndex >= 0) state.coupon_snapshots[couponIndex] = { ...state.coupon_snapshots[couponIndex], ...coupon };
          else state.coupon_snapshots.push(coupon);
        }
        if (!state.sync_runs.some((entry) => entry.id === syncRun.id)) state.sync_runs.push(syncRun);
        const update = clone(args.connector_update);
        state.connectors[connectorIndex] = {
          ...state.connectors[connectorIndex],
          status: update.status,
          sync_status: update.sync_status,
          last_sync_at: update.last_sync_at,
          last_successful_sync_at: update.last_successful_sync_at,
          last_error_json: update.last_error_json,
        };
        return Promise.resolve({ data: null, error: null });
      }

      return Promise.resolve({ data: null, error: { message: `Unknown RPC: ${name}` } });
    },
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
