import { Handle, Position } from "reactflow";

interface Props {
  data: {
    label: string;
    kind: "api" | "database";
    capacity: number;
    latency: number;
    currentLoad: number;
    overloaded: boolean;
  };
}

export default function SystemNode({ data }: Props) {
  const isApi = data.kind === "api";

  const background = data.overloaded
    ? "#7f1d1d"
    : isApi
    ? "#1e3a8a"
    : "#14532d";

  const border = data.overloaded
    ? "#ef4444"
    : isApi
    ? "#3b82f6"
    : "#22c55e";

  return (
    <div
      style={{
        padding: 15,
        borderRadius: 8,
        border: `2px solid ${border}`,
        background,
        color: "white",
        minWidth: 180,
      }}
    >
      <strong>{data.label}</strong>

      <div style={{ fontSize: 12, marginTop: 8 }}>
        Capacity: {data.capacity}
        <br />
        Latency: {data.latency}ms
        <br />
        Load: {data.currentLoad}
      </div>

      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}