import { Handle, Position } from "reactflow";
import { AlertCircle, Clock, DollarSign, ThumbsDown, Database, Filter } from "lucide-react";
import { Badge } from "./ui/badge";

const PlanNode = ({ data }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-300";
      case "medium":
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const getCostClass = (value, threshold = 100) => {
    if (!value) return "";
    if (value > threshold * 2) return "bg-red-100 text-red-700";
    if (value > threshold) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const getRowsAccuracyClass = (planned, actual) => {
    if (!planned || !actual) return "";
    const ratio = actual / planned;
    if (ratio < 0.1 || ratio > 10) return "bg-red-100 text-red-700";
    if (ratio < 0.5 || ratio > 2) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "-";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(2) + "K";
    return num.toFixed(2);
  };

  return (
    <div className="min-w-[280px] max-w-[320px]">
      <Handle type="target" position={Position.Top} />

      <div className={`rounded-lg border-2 shadow-md p-3 bg-white ${data.severity ? getSeverityColor(data.severity) : 'border-gray-200'}`}>
        {/* Header with Node Type */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="font-bold text-sm text-gray-900 mb-1">{data.label}</div>
            {data.details["Relation Name"] && (
              <div className="text-xs text-gray-600">
                <Database className="inline h-3 w-3 mr-1" />
                <span className="font-medium">{data.details["Relation Name"]}</span>
                {data.details["Alias"] && data.details["Alias"] !== data.details["Relation Name"] && (
                  <span className="text-gray-500"> as {data.details["Alias"]}</span>
                )}
              </div>
            )}
            {data.details["Index Name"] && (
              <div className="text-xs text-blue-600 mt-1">
                Index: {data.details["Index Name"]}
              </div>
            )}
          </div>
          {data.aiAdvice && (
            <AlertCircle
              className={`h-4 w-4 flex-shrink-0 ml-2 ${
                data.severity === "high"
                  ? "text-red-600"
                  : data.severity === "medium"
                  ? "text-orange-600"
                  : "text-blue-600"
              }`}
              data-testid="ai-warning-icon"
            />
          )}
        </div>

        {/* Metrics Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {data.details["Actual Time"] !== undefined && (
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${getCostClass(data.details["Actual Time"], 1)}`}
            >
              <Clock className="h-3 w-3 mr-1 inline" />
              {formatNumber(data.details["Actual Time"])}ms
            </Badge>
          )}
          {data.details["Total Cost"] !== undefined && (
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${getCostClass(data.details["Total Cost"], 100)}`}
            >
              <DollarSign className="h-3 w-3 mr-1 inline" />
              {formatNumber(data.details["Total Cost"])}
            </Badge>
          )}
          {data.details["Actual Rows"] !== undefined && data.details["Plan Rows"] !== undefined && (
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${
                getRowsAccuracyClass(data.details["Plan Rows"], data.details["Actual Rows"])
              }`}
            >
              {data.details["Actual Rows"]} / {formatNumber(data.details["Plan Rows"])} rows
            </Badge>
          )}
        </div>

        {/* Detailed Information */}
        <div className="space-y-1 text-xs">
          {/* Join Condition */}
          {data.details["Hash Cond"] && (
            <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
              <span className="text-gray-500 font-medium">Hash on:</span>
              <div className="font-mono text-gray-700 mt-0.5">{data.details["Hash Cond"]}</div>
            </div>
          )}
          {data.details["Join Filter"] && (
            <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
              <span className="text-gray-500 font-medium">Join Filter:</span>
              <div className="font-mono text-gray-700 mt-0.5">{data.details["Join Filter"]}</div>
            </div>
          )}
          {data.details["Filter"] && (
            <div className="bg-yellow-50 p-1.5 rounded border border-yellow-200">
              <Filter className="inline h-3 w-3 mr-1 text-yellow-600" />
              <span className="text-gray-500 font-medium">Filter:</span>
              <div className="font-mono text-gray-700 mt-0.5 line-clamp-2">{data.details["Filter"]}</div>
            </div>
          )}
          {data.details["Sort Key"] && (
            <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <div className="font-mono text-gray-700 mt-0.5">{data.details["Sort Key"]}</div>
            </div>
          )}
          {data.details["Sort Method"] && (
            <div className="text-gray-600">
              <span className="font-medium">Method:</span> {data.details["Sort Method"]}
              {data.details["Sort Space Used"] && (
                <span className="ml-1">({data.details["Sort Space Used"]})</span>
              )}
            </div>
          )}

          {/* Cost Details */}
          {(data.details["Startup Cost"] !== undefined || data.details["Plan Width"] !== undefined) && (
            <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
              {data.details["Startup Cost"] !== undefined && (
                <span>Start: {formatNumber(data.details["Startup Cost"])}</span>
              )}
              {data.details["Plan Width"] !== undefined && (
                <span>Width: {data.details["Plan Width"]}</span>
              )}
            </div>
          )}

          {/* Buffers */}
          {(data.details["Shared Hit Blocks"] || data.details["Shared Read Blocks"]) && (
            <div className="text-gray-600 pt-1 border-t border-gray-200">
              <span className="font-medium">Buffers:</span>
              {data.details["Shared Hit Blocks"] && (
                <span className="ml-1">Hit: {data.details["Shared Hit Blocks"]}</span>
              )}
              {data.details["Shared Read Blocks"] && (
                <span className="ml-1">Read: {data.details["Shared Read Blocks"]}</span>
              )}
            </div>
          )}

          {/* AI Advice */}
          {data.aiAdvice && (
            <div
              className={`mt-2 p-2 rounded text-xs ${
                data.severity === "high"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : data.severity === "medium"
                  ? "bg-orange-50 border border-orange-200 text-orange-800"
                  : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
            >
              <div className="font-semibold mb-1 flex items-center">
                <ThumbsDown className="h-3 w-3 mr-1" />
                AI Suggestion:
              </div>
              <div className="line-clamp-3">{data.aiAdvice}</div>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default PlanNode;
