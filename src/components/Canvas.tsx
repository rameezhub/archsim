import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";

import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";
import { useCallback, useState } from "react";
import SystemNode from "./SystemNode";

let id = 1;

const nodeTypes = {
  system: SystemNode,
};

type SystemData = {
  label: string;
  kind: "api" | "database";
  capacity: number;
  latency: number;
  currentLoad: number;
  overloaded: boolean;
};

const initialNodes: Node<SystemData>[] = [
  {
    id: "1",
    type: "system",
    position: { x: 250, y: 150 },
    data: {
      label: "API Server",
      kind: "api",
      capacity: 1000,
      latency: 20,
      currentLoad: 0,
      overloaded: false,
    },
  },
];

const initialEdges: Edge[] = [];

function Flow() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<SystemData>(initialNodes);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] =
    useState<string | null>(null);

  const [rps, setRps] = useState(1000);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (kind: "api" | "database") => {
    id++;

    const newNode: Node<SystemData> = {
      id: id.toString(),
      type: "system",
      position: {
        x: Math.random() * 600,
        y: Math.random() * 400,
      },
      data: {
        label: kind === "api" ? "API Server" : "Database",
        kind,
        capacity: kind === "api" ? 1000 : 500,
        latency: kind === "api" ? 20 : 40,
        currentLoad: 0,
        overloaded: false,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (selectedNode) {
      const connection: Connection = {
        source: selectedNode,
        target: newNode.id,
      };

      setEdges((eds) => addEdge(connection, eds));
    }
  };

  // 🔥 REALISTIC GRAPH TRAVERSAL SIMULATION
  const simulateLoad = () => {
    // Reset all nodes
    let updated = nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        currentLoad: 0,
        overloaded: false,
      },
    }));

    // Build adjacency list
    const graph: Record<string, string[]> = {};

    edges.forEach((e) => {
      if (!graph[e.source]) graph[e.source] = [];
      graph[e.source].push(e.target);
    });

    // Find entry nodes (no incoming edges)
    const incomingSet = new Set(edges.map((e) => e.target));
    const entryNodes = updated.filter(
      (n) => !incomingSet.has(n.id)
    );

    const queue: { id: string; load: number }[] = [];

    entryNodes.forEach((n) =>
      queue.push({ id: n.id, load: rps })
    );

    while (queue.length > 0) {
      const { id, load } = queue.shift()!;
      const node = updated.find((n) => n.id === id);
      if (!node) continue;

      // 🔥 Throughput limiting
      const acceptedLoad = Math.min(load, node.data.capacity);

      node.data.currentLoad += load;

      if (load > node.data.capacity) {
        node.data.overloaded = true;
      }

      const children = graph[id] || [];

      if (children.length > 0) {
        const splitLoad = acceptedLoad / children.length;

        children.forEach((childId) => {
          queue.push({ id: childId, load: splitLoad });
        });
      }
    }

    setNodes(updated);
  };

  const deleteSelected = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.filter((n) => n.id !== selectedNode)
    );

    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.source !== selectedNode &&
          e.target !== selectedNode
      )
    );

    setSelectedNode(null);
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div
        style={{
          width: 260,
          background: "#111",
          padding: 20,
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <h3>Components</h3>

        <button onClick={() => addNode("api")}>Add API</button>
        <button onClick={() => addNode("database")}>
          Add Database
        </button>

        <hr />

        <h4>Simulation</h4>

        <input
          type="number"
          value={rps}
          onChange={(e) =>
            setRps(Number(e.target.value))
          }
        />

        <button onClick={simulateLoad}>
          Run Simulation
        </button>

        <hr />

        <button onClick={deleteSelected}>
          Delete Selected
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) =>
            setSelectedNode(node.id)
          }
          fitView
          style={{ width: "100%", height: "100%" }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}