function localDateInput(daysFromToday = 0, now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

module.exports = { localDateInput };
