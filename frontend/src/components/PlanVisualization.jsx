import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import PlanNode from "./PlanNode";

const nodeTypes = {
  planNode: PlanNode,
};

const PlanVisualization = ({ plan, query, aiAnalysis, className }) => {
  // Convert query plan to React Flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!plan || !plan.Plan) return { nodes: [], edges: [] };

    const nodes = [];
    const edges = [];
    let nodeId = 0;

    const processNode = (node, parentId = null, level = 0, xOffset = 0) => {
      const currentId = `node-${nodeId++}`;
      const nodeAnalysis = aiAnalysis?.node_analysis?.[currentId] || null;

      // Determine node color based on type and AI analysis
      let nodeColor = "#ffffff"; // white
      let borderColor = "#d1d5db"; // gray

      if (nodeAnalysis?.severity === "high") {
        nodeColor = "#fee2e2"; // red-100
        borderColor = "#dc2626"; // red-600
      } else if (nodeAnalysis?.severity === "medium") {
        nodeColor = "#ffedd5"; // orange-100
        borderColor = "#ea580c"; // orange-600
      } else if (node["Node Type"]?.includes("Seq Scan")) {
        nodeColor = "#fef3c7"; // yellow-100
        borderColor = "#f59e0b"; // yellow-500
      } else if (node["Node Type"]?.includes("Index")) {
        nodeColor = "#d1fae5"; // green-100
        borderColor = "#10b981"; // green-500
      }

      // Extract more details from the node
      const details = {
        "Total Cost": node["Total Cost"],
        "Startup Cost": node["Startup Cost"],
        "Plan Rows": node["Plan Rows"],
        "Plan Width": node["Plan Width"],
        "Actual Rows": node["Actual Rows"],
        "Actual Time": node["Actual Total Time"],
        "Relation Name": node["Relation Name"],
        "Alias": node["Alias"],
        "Index Name": node["Index Name"],
        "Filter": node["Filter"],
        "Hash Cond": node["Hash Cond"],
        "Join Filter": node["Join Filter"],
        "Sort Key": Array.isArray(node["Sort Key"]) ? node["Sort Key"].join(", ") : node["Sort Key"],
        "Sort Method": node["Sort Method"],
        "Sort Space Used": node["Sort Space Used"],
        "Sort Space Type": node["Sort Space Type"],
        "Shared Hit Blocks": node["Shared Hit Blocks"],
        "Shared Read Blocks": node["Shared Read Blocks"],
        "Shared Written Blocks": node["Shared Written Blocks"],
        "Join Type": node["Join Type"],
        "Index Cond": node["Index Cond"],
        "Scan Direction": node["Scan Direction"],
      };

      nodes.push({
        id: currentId,
        type: "planNode",
        position: { x: xOffset * 400, y: level * 220 }, // Increased spacing for larger nodes
        data: {
          label: node["Node Type"] || "Unknown",
          details: details,
          aiAdvice: nodeAnalysis?.advice,
          severity: nodeAnalysis?.severity,
        },
        style: {
          background: "transparent",
          border: "none",
          padding: 0,
        },
      });

      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${currentId}`,
          source: parentId,
          target: currentId,
          type: "smoothstep",
          animated: false,
          style: {
            stroke: borderColor,
            strokeWidth: 2,
          },
        });
      }

      // Process child plans
      if (node.Plans && node.Plans.length > 0) {
        const childOffset = xOffset - (node.Plans.length - 1) / 2;
        node.Plans.forEach((childNode, index) => {
          processNode(childNode, currentId, level + 1, childOffset + index);
        });
      }

      return currentId;
    };

    processNode(plan.Plan);

    return { nodes, edges };
  }, [plan, aiAnalysis]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (!plan) {
    return null;
  }

  return (
    <Card className={className || "h-[700px]"} data-testid="plan-visualization">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Query Execution Plan</CardTitle>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-500 rounded"></div>
              <span>Index Scan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded"></div>
              <span>Seq Scan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 border border-orange-600 rounded"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-600 rounded"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-80px)]">
        <div className="h-full w-full border rounded-lg bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            data-testid="react-flow-canvas"
          >
            <Background color="#e5e7eb" gap={16} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.data.severity === "high") return "#fca5a5";
                if (node.data.severity === "medium") return "#fdba74";
                if (node.data.label?.includes("Seq Scan")) return "#fde047";
                if (node.data.label?.includes("Index")) return "#6ee7b7";
                return "#d1d5db";
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanVisualization;
