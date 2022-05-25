export function saveToDB(network, name, data) {
  const current_data = {
    ...JSON.parse(localStorage.getItem(network)),
  };
  const updated_data = { ...current_data };
  updated_data[name] = data;
  localStorage.setItem(network, JSON.stringify(updated_data));
}
