// .sql 을 `export default "<SQL>"` 모듈로 바꿔 Expo 기본 Babel transformer 에 넘긴다 (drizzle 마이그레이션 import 용).
// .sql 파일이 그 자체로 모듈이 되므로, 내용을 고치면 Metro 캐시가 알아서 다시 변환한다.
const upstream = require("@expo/metro-config/babel-transformer");

module.exports = {
  ...upstream,
  transform(args) {
    if (args.filename.endsWith(".sql")) {
      return upstream.transform({ ...args, src: `export default ${JSON.stringify(args.src)};\n` });
    }
    return upstream.transform(args);
  },
};
