"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";

const seedNodes = [
  {
    id: "1",
    data: { label: "React", note: "UI library" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    data: { label: "Next.js", note: "React framework" },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    data: { label: "TypeScript", note: "Typed JS" },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    data: { label: "State Management", note: "Managing state" },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    data: { label: "Component Design", note: "Reusable UI" },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    data: { label: "Performance", note: "Optimization" },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    data: { label: "Testing", note: "Testing strategies" },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    data: { label: "CSS & Styling", note: "Styling methods" },
    position: { x: 0, y: 0 },
  },
];

const seedEdges = [
  { id: "e2-1", source: "2", target: "1", label: "built on" },
  { id: "e1-3", source: "1", target: "3", label: "pairs well with" },
  { id: "e1-4", source: "1", target: "4", label: "uses" },
  { id: "e1-5", source: "1", target: "5", label: "guides" },
  { id: "e2-6", source: "2", target: "6", label: "improves" },
  { id: "e1-7", source: "1", target: "7", label: "requires" },
  { id: "e1-8", source: "1", target: "8", label: "styled with" },
  { id: "e4-6", source: "4", target: "6", label: "impacts" },
  { id: "e5-6", source: "5", target: "6", label: "impacts" },
];

const applyLayout = (nodes: any[]) => {
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % 4) * 200,
      y: Math.floor(index / 4) * 150,
    },
    style: {
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "12px",
      background: "#ffffff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      fontSize: "14px",
      fontWeight: 500,
      transition: "all 0.2s ease",
    },
  }));
};

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const [edgeModalOpen, setEdgeModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<any>(null);
  const [edgeLabel, setEdgeLabel] = useState("");
  //  Connect nodes
  const onConnect = useCallback(
    (params: any) => {
      setPendingConnection(params);
      setEdgeModalOpen(true);
    },
    [setPendingConnection],
  );

  //  Add node
  const addNode = () => {
    const newNode = {
      id: Date.now().toString(),
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: "New Node", note: "" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  //  Load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("graph") || "null");

    if (saved && saved.nodes?.length) {
      setNodes(saved.nodes);
      setEdges(saved.edges);
    } else {
      const layoutedNodes = applyLayout(seedNodes);
      setNodes(layoutedNodes);
      setEdges(seedEdges);
    }
    setIsLoaded(true);
  }, [setNodes, setEdges]);

  //  Save
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("graph", JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges, isLoaded]);

  //  Node click
  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  //  Update node
  const updateNodeData = (field: string, value: string) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              [field]: value,
            },
          };
        }
        return n;
      }),
    );

    setSelectedNode((prev: any) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));
  };

  // Auto-close sidebar if node deleted
  useEffect(() => {
    if (selectedNode) {
      const exists = nodes.find((n) => n.id === selectedNode.id);
      if (!exists) setSelectedNode(null);
    }
  }, [nodes, selectedNode]);

  const handleNodesDelete = useCallback(
    (deletedNodes: any[]) => {
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !deletedNodes.some(
              (node) => node.id === edge.source || node.id === edge.target,
            ),
        ),
      );
    },
    [setEdges],
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: any[]) => {
      setEdges((eds) =>
        eds.filter((edge) => !deletedEdges.some((e) => e.id === edge.id)),
      );
    },
    [setEdges],
  );

  const handleAddEdge = () => {
    if (!edgeLabel || !pendingConnection) return;

    setEdges((eds) =>
      addEdge(
        {
          ...pendingConnection,
          label: edgeLabel,
        },
        eds,
      ),
    );

    setEdgeModalOpen(false);
    setEdgeLabel("");
    setPendingConnection(null);
  };
  const getHighlightedNodes = () => {
    if (!selectedNode) return nodes;

    const connectedNodeIds = new Set();

    edges.forEach((edge) => {
      if (edge.source === selectedNode.id) {
        connectedNodeIds.add(edge.target);
      }
      if (edge.target === selectedNode.id) {
        connectedNodeIds.add(edge.source);
      }
    });

    return nodes.map((node) => {
      const isConnected =
        node.id === selectedNode.id || connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isConnected ? 1 : 0.3,
          border: isConnected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
          transform: isConnected ? "scale(1.05)" : "scale(1)",
        },
      };
    });
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button
        onClick={addNode}
        style={{
          position: "absolute",
          zIndex: 10,
          top: 20,
          left: 20,
          padding: "10px 16px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        + Add Node
      </button>

      {/* Sidebar */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "320px",
            height: "100%",
            background: "#ffffff",
            borderLeft: "1px solid #e5e7eb",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.05)",
            padding: "20px",
            zIndex: 20,
          }}
        >
          <h3>Edit Node</h3>

          <label>Title</label>
          <input
            type="text"
            value={selectedNode.data.label || ""}
            onChange={(e) => updateNodeData("label", e.target.value)}
            style={{
              width: "100%",
              marginBottom: "12px",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />

          <label>Note</label>
          <textarea
            value={selectedNode.data.note || ""}
            onChange={(e) => updateNodeData("note", e.target.value)}
            style={{ width: "100%", height: "100px" }}
          />

          <button onClick={() => setSelectedNode(null)}>Close</button>
        </div>
      )}

      <Dialog open={edgeModalOpen} onOpenChange={setEdgeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="e.g. depends on"
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
          />

          <Button onClick={handleAddEdge} className="mt-2 w-full">
            Add Edge
          </Button>
        </DialogContent>
      </Dialog>

      <ReactFlow
        nodes={getHighlightedNodes()}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        deleteKeyCode={["Backspace", "Delete"]}
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
