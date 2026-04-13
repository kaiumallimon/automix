import type { BaseEntity } from "./index";

export type ApiConfigAuthType = "none" | "jwt";
export type ApiConfigHeaders = Record<string, string>;

export interface ApiConfig extends BaseEntity {
  name: string;
  baseUrl: string;
  defaultHeaders: ApiConfigHeaders;
  authType: ApiConfigAuthType;
}

export interface ApiConfigInput {
  name: string;
  baseUrl: string;
  defaultHeaders: ApiConfigHeaders;
  authType: ApiConfigAuthType;
}

export type ApiConfigPatchInput = Partial<ApiConfigInput>;
