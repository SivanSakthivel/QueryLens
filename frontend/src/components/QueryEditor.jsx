import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Play, Loader2 } from "lucide-react";

const QueryEditor = ({
  onExecute,
  isAnalyzing,
  defaultValue,
  onChange,
  hideExecuteButton = false,
  placeholder = "Enter your SQL query here...",
  height = "min-h-[150px]"
}) => {
  // Internal state for when component is uncontrolled
  const [internalQuery, setInternalQuery] = useState(
    defaultValue || "SELECT * FROM users WHERE email = 'test@example.com';"
  );

  // Determine if controlled or uncontrolled
  const isControlled = defaultValue !== undefined;
  const query = isControlled ? defaultValue : internalQuery;

  const handleChange = (e) => {
    const val = e.target.value;

    // Always update internal state (good practice for hybrid)
    if (!isControlled) {
      setInternalQuery(val);
    }

    // Always notify parent
    if (onChange) {
      onChange(val);
    }
  };

  const handleExecute = () => {
    if (query.trim()) {
      onExecute(query);
    }
  };

  return (
    <Card data-testid="query-editor-card">
      <CardHeader>
        <CardTitle>SQL Query</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={defaultValue !== undefined ? defaultValue : query}
          onChange={handleChange}
          placeholder={placeholder}
          className={`font-mono text-sm ${height}`}
          data-testid="query-textarea"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
        />
        {!hideExecuteButton && (
          <div className="flex justify-end">
            <Button
              onClick={handleExecute}
              disabled={isAnalyzing || !query.trim()}
              data-testid="execute-query-button"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Analyze Query
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueryEditor;
