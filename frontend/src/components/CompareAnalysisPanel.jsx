import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const CompareAnalysisPanel = ({ comparison, isLoading }) => {
    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>AI Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500">Comparing query plans...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!comparison) {
        return null;
    }

    return (
        <Card className="h-full overflow-auto bg-slate-50 border-l-4 border-l-blue-500">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl">⚖️</span>
                    <CardTitle>Analysis Comparison</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{comparison.summary}</p>
                </div>

                {/* Comparison Metrics */}
                {comparison.metrics_comparison && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">Key Differences</h3>
                        <div className="space-y-2">
                            {comparison.metrics_comparison.cost_diff && (
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <div>
                                        <span className="font-medium text-gray-900">Cost:</span>{" "}
                                        <span className="text-gray-700">
                                            {comparison.metrics_comparison.cost_diff}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {comparison.metrics_comparison.time_diff && (
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <div>
                                        <span className="font-medium text-gray-900">Time:</span>{" "}
                                        <span className="text-gray-700">
                                            {comparison.metrics_comparison.time_diff}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Structural Changes */}
                {comparison.structural_changes && comparison.structural_changes.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Structural Changes
                        </h3>
                        <ul className="space-y-2">
                            {comparison.structural_changes.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">→</span>
                                    <span className="text-gray-700">{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Recommendation */}
                {comparison.recommendation && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                            <span>💡</span> Recommendation
                        </h3>
                        <p className="text-green-800">{comparison.recommendation}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CompareAnalysisPanel;
