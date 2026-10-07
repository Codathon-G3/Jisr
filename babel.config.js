module.exports = function(api) {
  const isMetro = api.caller((caller) => Boolean(caller && (caller.name === 'metro' || caller.name === 'metro-babel-transformer')));
  if (isMetro) {
    return {
      presets: ['babel-preset-expo'],
    };
  }
  return {
    presets: ['next/babel'],
  };
};
