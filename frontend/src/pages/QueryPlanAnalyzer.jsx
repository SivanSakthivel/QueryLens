import { useState } from "react";
import axios from "axios";
import PostgreSQLConnect from "../components/PostgreSQLConnect";
import QueryEditor from "../components/QueryEditor";
import PlanVisualization from "../components/PlanVisualization";
import AISuggestionsPanel from "../components/AISuggestionsPanel";
import CompareAnalysisPanel from "../components/CompareAnalysisPanel";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `http://localhost:8000/api`;

const QueryPlanAnalyzer = () => {
  const [sessionId, setSessionId] = useState(null);

  // Single Mode State
  const [queryPlan, setQueryPlan] = useState(null);
  const [query, setQuery] = useState("SELECT * FROM users WHERE email = 'test@example.com';");
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Compare Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [query1, setQuery1] = useState("");
  const [query2, setQuery2] = useState("");
  const [plan1, setPlan1] = useState(null);
  const [plan2, setPlan2] = useState(null);
  const [compareAnalysis, setCompareAnalysis] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);

  const handleConnect = (sid) => {
    setSessionId(sid);
    toast.success("Connected to PostgreSQL successfully!");
  };

  const executeSingleQuery = async (queryText) => {
    try {
      setQuery(queryText);
      setIsAnalyzing(true);
      setQueryPlan(null);
      setAiAnalysis(null);

      // Execute EXPLAIN
      const planResponse = await axios.post(`${API}/pg/execute-explain`, {
        session_id: sessionId,
        query: queryText,
        analyze: true,
      });

      if (planResponse.data.success && planResponse.data.plan) {
        setQueryPlan(planResponse.data.plan);
        toast.success("Query plan generated!");

        // Get AI analysis
        const analysisResponse = await axios.post(`${API}/pg/analyze-plan`, {
          plan: planResponse.data.plan,
          query: queryText,
        });

        if (analysisResponse.data.success) {
          setAiAnalysis(analysisResponse.data.analysis);
          toast.success("AI analysis complete!");
        } else {
          toast.error(
            "AI analysis failed: " + (analysisResponse.data.error || "Unknown error")
          );
        }
      } else {
        toast.error(
          "Failed to generate plan: " +
          (planResponse.data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error executing query:", error);
      toast.error("Error: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeCompareQueries = async () => {
    if (!query1 || !query2) {
      toast.error("Please enter both queries to compare");
      return;
    }

    try {
      setIsAnalyzing(true);
      setPlan1(null);
      setPlan2(null);
      setCompareAnalysis(null);

      // Execute both queries
      const [res1, res2] = await Promise.all([
        axios.post(`${API}/pg/execute-explain`, {
          session_id: sessionId,
          query: query1,
          analyze: true,
        }),
        axios.post(`${API}/pg/execute-explain`, {
          session_id: sessionId,
          query: query2,
          analyze: true,
        })
      ]);

      if (res1.data.success && res2.data.success) {
        setPlan1(res1.data.plan);
        setPlan2(res2.data.plan);
        toast.success("Both plans generated!");

        // Get Comparison
        const compareResponse = await axios.post(`${API}/pg/compare-plans`, {
          plan1: res1.data.plan,
          plan2: res2.data.plan,
          query1: query1,
          query2: query2
        });

        if (compareResponse.data.success) {
          setCompareAnalysis(compareResponse.data.comparison);
          toast.success("Comparison complete!");
        } else {
          toast.error("Comparison failed: " + compareResponse.data.error);
        }

      } else {
        toast.error("Failed to generate one or both plans");
      }

    } catch (error) {
      console.error("Error comparing queries:", error);
      toast.error("Error: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PostgreSQL Query Plan Analyzer
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Visualize and optimize your queries with AI-powered insights
              </p>
            </div>

            <div className="flex items-center gap-6">
              {sessionId && (
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                  <Switch
                    id="compare-mode"
                    checked={isCompareMode}
                    onCheckedChange={setIsCompareMode}
                  />
                  <Label htmlFor="compare-mode" className="cursor-pointer font-medium">Compare Mode</Label>
                </div>
              )}

              {sessionId && (
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Connected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 py-6 pb-20">
        {!sessionId ? (
          <div className="max-w-2xl mx-auto">
            <PostgreSQLConnect onConnect={handleConnect} />
          </div>
        ) : (
          <div className="space-y-6">
            {!isCompareMode ? (
              // SINLGE MODE
              <>
                <QueryEditor
                  onExecute={executeSingleQuery}
                  isAnalyzing={isAnalyzing}
                  defaultValue={query}
                  onChange={(val) => setQuery(val)}
                />

                {queryPlan && (
                  <div className="flex gap-6 h-[800px]">
                    <div
                      className={`transition-all duration-300 h-full ${aiPanelCollapsed ? "w-full" : "w-2/3"
                        }`}
                    >
                      <PlanVisualization
                        plan={queryPlan}
                        query={query}
                        aiAnalysis={aiAnalysis}
                        className="h-full"
                      />
                    </div>

                    <div
                      className={`transition-all duration-300 h-full ${aiPanelCollapsed ? "w-12" : "w-1/3"
                        }`}
                    >
                      <AISuggestionsPanel
                        analysis={aiAnalysis}
                        plan={queryPlan}
                        query={query}
                        isLoading={isAnalyzing}
                        collapsed={aiPanelCollapsed}
                        onToggleCollapse={() => setAiPanelCollapsed(!aiPanelCollapsed)}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              // COMPARE MODE
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={executeCompareQueries}
                    disabled={isAnalyzing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm"
                  >
                    {isAnalyzing ? "Comparing..." : "Compare Queries"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="font-semibold text-lg text-gray-700 border-b pb-2">Plan A (Baseline)</div>
                    <QueryEditor
                      onExecute={() => { }} // Disabled in individual editors for compare mode
                      isAnalyzing={isAnalyzing}
                      hideExecuteButton={true}
                      defaultValue={query1}
                      onChange={(val) => setQuery1(val)}
                      placeholder="Enter baseline query..."
                      height="h-48"
                    />
                    {plan1 && (
                      <PlanVisualization
                        plan={plan1}
                        query={query1}
                        className="h-[500px]"
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="font-semibold text-lg text-gray-700 border-b pb-2">Plan B (Candidate)</div>
                    <QueryEditor
                      onExecute={() => { }}
                      isAnalyzing={isAnalyzing}
                      hideExecuteButton={true}
                      defaultValue={query2}
                      onChange={(val) => setQuery2(val)}
                      placeholder="Enter optimized query..."
                      height="h-48"
                    />
                    {plan2 && (
                      <PlanVisualization
                        plan={plan2}
                        query={query2}
                        className="h-[500px]"
                      />
                    )}
                  </div>
                </div>

                {compareAnalysis && (
                  <div className="mt-8 border-t pt-8">
                    <div className="font-semibold text-xl text-gray-800 mb-4">Comparison Analysis</div>
                    <div className="h-[400px]">
                      <CompareAnalysisPanel comparison={compareAnalysis} isLoading={isAnalyzing} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryPlanAnalyzer;
