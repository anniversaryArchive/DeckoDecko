import { randomUUID } from "expo-crypto";

import { db } from "./client.native";
import { createLocalRepositories } from "./localRepositories";

export const localRepositories = createLocalRepositories(db, randomUUID);
