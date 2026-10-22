"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";

import { createQueryClient } from "./queryClient";
import type { LocalRepositories, Repositories } from "../repositories";

const RepositoriesContext = createContext<Repositories | null>(null);

type Props = {
  /** 화면이 쓸 저장소 묶음. 앱은 apps/mobile/lib/repositories.ts 에서 만든다. */
  repositories: Repositories;
  queryClient?: QueryClient; // 테스트에서 바꿔 끼울 때만 넘긴다. 기본은 createQueryClient()
  children: ReactNode;
};

/** React Query 와 저장소를 한 번에 제공한다. 루트 레이아웃에서 ThemeProvider 안쪽에 둔다. */
export function CoreProvider({ repositories, queryClient, children }: Props) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * 저장소 묶음을 꺼낸다. 이 패키지의 훅(<도메인>.hooks.ts)이 쓰기 위한 것이고, 화면에서 직접 부르지 않는다 (AGENTS.md).
 */
export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext);
  if (!repositories) {
    throw new Error("useRepositories 는 CoreProvider 안에서만 쓸 수 있다.");
  }
  return repositories;
}

/** 로컬 기록 저장소(items · folders)를 꺼낸다. 넘기지 않은 앱(백오피스)에서 로컬 기록 훅을 쓰면 던진다. */
export function useLocalRepositories(): LocalRepositories {
  const { items, folders } = useRepositories();
  if (!items || !folders) {
    throw new Error(
      "로컬 기록 훅은 CoreProvider 에 items · folders 저장소를 넘긴 앱에서만 쓸 수 있다."
    );
  }
  return { items, folders };
}
