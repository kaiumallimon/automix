import type { BaseEntity } from "./index";

export type ScenarioHttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type ScenarioJsonPrimitive = boolean | number | string | null;
export type ScenarioJsonArray = ScenarioJsonValue[];
export type ScenarioJsonValue =
  | ScenarioJsonArray
  | ScenarioJsonObject
  | ScenarioJsonPrimitive;

export interface ScenarioJsonObject {
  [key: string]: ScenarioJsonValue;
}

export type ScenarioHeaders = Record<string, string>;
export type ScenarioVariableCaptureMap = Record<string, string>;

export interface ScenarioStep {
  id: string;
  name: string;
  method: ScenarioHttpMethod;
  endpoint: string;
  headers: ScenarioHeaders;
  body: ScenarioJsonValue;
  expectedStatus: number;
  expectedResponse: ScenarioJsonObject;
  capture: ScenarioVariableCaptureMap;
}

export interface Scenario extends BaseEntity {
  apiConfigId: string;
  name: string;
  description: string | null;
  steps: ScenarioStep[];
}

export interface ScenarioInput {
  apiConfigId: string;
  name: string;
  description: string | null;
  steps: ScenarioStep[];
}

export type ScenarioPatchInput = Partial<ScenarioInput>;
