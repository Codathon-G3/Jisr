module.exports = function (api) {
  const isMetro = api.caller((caller) => caller && caller.name === "metro");
  api.cache.using(() => (isMetro ? "metro" : "next"));

  if (isMetro) {
    return {
      presets: ["babel-preset-expo"],
    };
  }

  return {
    presets: ["next/babel"],
  };
};
