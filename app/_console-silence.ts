if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  for (const method of [
    "log",
    "warn",
    "error",
    "info",
    "debug",
    "trace",
    "table",
    "group",
    "groupCollapsed",
    "groupEnd",
    "dir",
    "dirxml",
    "profile",
    "profileEnd",
    "time",
    "timeEnd",
    "timeLog",
    "timeStamp",
    "clear",
    "count",
    "countReset",
    "assert",
  ]) {
    // @ts-ignore
    window.console[method] = () => {};
  }
}
