export type NodeKind = "api" | "database";

export interface SystemNodeData {
  label: string;
  kind: NodeKind;
  capacity: number;
  latency: number;
}