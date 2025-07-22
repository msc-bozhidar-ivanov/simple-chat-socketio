export function formatTimestamp(time = null) {
  return new Date(time ?? Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
