class ConnectorError extends Error {
  constructor(type, message, extra = {}) {
    super(message);
    this.name = "ConnectorError";
    this.type = type;
    this.extra = extra;
  }
}

module.exports = { ConnectorError };
