import { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Database, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `http://localhost:8000/api`;

const PostgreSQLConnect = ({ onConnect }) => {
  const [formData, setFormData] = useState({
    host: "host.docker.internal",
    port: 5432,
    username: "postgres",
    password: "",
    database: "postgres",
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    try {
      const response = await axios.post(`${API}/pg/connect`, formData);
      if (response.data.success) {
        onConnect(response.data.session_id);
      } else {
        setError(response.data.message || "Connection failed");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="shadow-lg" data-testid="pg-connect-card">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-600" />
          <CardTitle>Connect to PostgreSQL</CardTitle>
        </div>
        <CardDescription>
          Enter your PostgreSQL connection details to begin analyzing queries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="localhost"
                required
                data-testid="pg-host-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                name="port"
                type="number"
                value={formData.port}
                onChange={handleChange}
                placeholder="5432"
                required
                data-testid="pg-port-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="postgres"
              required
              data-testid="pg-username-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"

              data-testid="pg-password-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              name="database"
              value={formData.database}
              onChange={handleChange}
              placeholder="postgres"
              required
              data-testid="pg-database-input"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" data-testid="connection-error">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isConnecting}
            data-testid="pg-connect-button"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect to Database"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostgreSQLConnect;
