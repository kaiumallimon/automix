export type FirestoreCollection =
  | "users"
  | "apiConfigs"
  | "scenarios"
  | "runs"
  | "runSteps";

export type TimestampIsoString = string;

export interface BaseEntity {
  id: string;
  userId: string;
  createdAt: TimestampIsoString;
  updatedAt: TimestampIsoString;
}
