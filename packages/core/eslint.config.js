import { base } from "@deckodecko/eslint-config";

export default [
  ...base,
  {
    // 훅마다 기기 저장(localNetworkMode)인지 서버(serverNetworkMode)인지 고르게 한다. 고르지 않으면 오프라인 동작이 틀어진다 (queryClient.ts)
    files: ["src/react/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.name=/^use(Query|Mutation|InfiniteQuery)$/] > ObjectExpression:first-child:not(:has(Property[key.name='networkMode'])):not(:has(SpreadElement > Identifier[name=/NetworkMode$/]))",
          message:
            "networkMode 를 정해야 합니다. 기기에 저장하는 데이터면 ...localNetworkMode, 서버 데이터면 ...serverNetworkMode 를 넣으세요 (packages/core/src/react/queryClient.ts).",
        },
      ],
    },
  },
];
