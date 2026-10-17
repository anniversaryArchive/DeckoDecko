// drizzle 마이그레이션(.sql)을 문자열로 import 하기 위해 inline-import 를 붙인다.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};
