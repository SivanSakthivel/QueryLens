import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QueryPlanAnalyzer from "./pages/QueryPlanAnalyzer";

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QueryPlanAnalyzer />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
