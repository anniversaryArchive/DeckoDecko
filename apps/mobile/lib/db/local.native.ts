import { randomUUID } from "expo-crypto";

import { deletePhoto } from "../photos.native";
import { db } from "./client.native";
import { createLocalRepositories } from "./localRepositories";

export const localRepositories = createLocalRepositories(db, randomUUID, deletePhoto);
