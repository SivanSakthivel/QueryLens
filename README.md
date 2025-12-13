# QueryLens 🔍

**See through the complexity of PostgreSQL queries with AI-powered visualization and optimization.**

An intelligent, full-stack application that transforms PostgreSQL query execution plans into interactive visualizations and actionable insights using Google Gemini AI.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)

> **Built for the Hat AI-thon** - Leveraging Google Gemini 2.5 Flash to make database optimization accessible to everyone.

## 📖 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Features

- **🎨 Visual Query Plans**: Interactive visualization of PostgreSQL `EXPLAIN` nodes using React Flow - see your query execution tree at a glance
- **🤖 AI-Powered Analysis**: Automatic detection of performance bottlenecks, cost analysis, and intelligent index recommendations powered by **Google Gemini 2.5 Flash**
- **💬 Interactive AI Chat**: Chat directly with an AI assistant about your specific query plan to get deeper insights and explanations
- **⚡ Query Editor**: Execute SQL queries directly against your PostgreSQL database with syntax highlighting
- **📊 Performance Metrics**: Detailed cost analysis, buffer usage, and execution time breakdown
- **🔍 Bottleneck Detection**: Automatically identifies Sequential Scans, expensive Sorts, and inefficient Joins
- **💡 Smart Recommendations**: Get actionable suggestions for query rewrites and index creation

## 🎬 Demo

### Query Plan Visualization
The application transforms complex PostgreSQL EXPLAIN output into an intuitive visual tree:

```
┌─────────────────────┐
│   Aggregate         │
│   Cost: 1234.56     │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Seq Scan   │ ⚠️ Bottleneck Detected!
    │  Cost: 1200 │
    └─────────────┘
```

### AI Analysis Example
```
🔍 Performance Analysis:
• Sequential Scan detected on 'users' table (1M rows)
• Recommendation: CREATE INDEX idx_users_email ON users(email)
• Expected improvement: 85% faster query execution
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Craco (Create React App Configuration Override)
- **Styling**: Tailwind CSS, Shadcn UI
- **Visualization**: React Flow
- **State/Networking**: Axios, React Hooks

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database Drivers**: `asyncpg` (PostgreSQL)
- **AI Integration**: Google Generative AI (`google-generativeai`)
- **API Documentation**: Automatic OpenAPI/Swagger docs

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Databases**: PostgreSQL (user-provided, connected via network)

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Browser   │ ◄─────► │   React     │ ◄─────► │   FastAPI    │
│             │         │  Frontend   │         │   Backend    │
└─────────────┘         └─────────────┘         └──────┬───────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────┐
                                          │  Google Gemini API  │
                                          │   (AI Analysis)     │
                                          └─────────────────────┘
                                                        │
                                                        ▼
                                          ┌─────────────────────┐
                                          │   PostgreSQL DB     │
                                          │  (Your Database)    │
                                          └─────────────────────┘
```

**Flow:**
1. User enters database credentials and SQL query
2. Frontend sends request to FastAPI backend
3. Backend executes `EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT JSON)` on PostgreSQL
4. Query plan is sent to Google Gemini for AI analysis
5. Results (visualization data + AI insights) returned to frontend
6. User can chat with AI for deeper understanding

## 📋 Prerequisites

- **[Docker](https://www.docker.com/products/docker-desktop)** and **Docker Compose** installed on your machine
- A **Google Gemini API Key** - [Get one free from Google AI Studio](https://aistudio.google.com/)
- A **PostgreSQL database** to analyze (can be local or remote)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SivanSakthivel/QueryLens.git
cd QueryLens
```

### 2. Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```bash
# backend/.env
CORS_ORIGINS="*"
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> **🔑 Get your API Key**: Visit [Google AI Studio](https://aistudio.google.com/) to generate a free Gemini API key.

#### Frontend Configuration
Create a `.env` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env
```

The default configuration should work:
```bash
# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 3. Build and Run with Docker
Start the entire stack using Docker Compose:
```bash
docker-compose up --build
```

This will:
- Build the React frontend (port 3000)
- Build the FastAPI backend (port 8000)
- Start both services with auto-restart

### 4. Access the Application
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📖 Usage Guide

### 1. Connect to Your Database
- Open the frontend at [http://localhost:3000](http://localhost:3000)
- Enter your PostgreSQL connection details:
  - **Host**: Your database host
  - **Port**: Usually `5432`
  - **Database**: Database name
  - **User**: Database username
  - **Password**: Database password (optional)

> **💡 Docker Tip**: To connect to a PostgreSQL database running on your local machine (localhost), use `host.docker.internal` as the Host instead of `localhost`.

### 2. Analyze a Query
- Enter your SQL query in the editor (e.g., `SELECT * FROM users WHERE email = 'test@example.com'`)
- Click **"Execute & Analyze"**
- The system will run `EXPLAIN (ANALYZE, COSTS, BUFFERS, FORMAT JSON)` on your query

### 3. Explore Insights
- **📊 Visualization**: See the tree structure of your query plan with cost metrics
- **🤖 AI Suggestions**: Review the right-hand panel for:
  - Identified bottlenecks (e.g., Sequential Scans, expensive Sorts)
  - Index creation suggestions with exact SQL commands
  - Query rewrite recommendations
  - Performance improvement estimates

### 4. Chat with AI
- Scroll to the bottom of the "AI Suggestions" panel
- Ask questions about your specific query plan:
  - *"Why is the cost of the sort node so high?"*
  - *"How exactly should I implement that index?"*
  - *"What does 'Nested Loop' mean in this context?"*
  - *"Can you explain the buffer usage?"*

### 5. Implement Recommendations
- Copy the suggested index creation commands
- Run them on your database
- Re-analyze the query to see the improvement!

## 🔧 Troubleshooting

### Connection Issues

**Problem**: "Connection failed" or "Could not connect to database"

**Solutions**:
- If connecting to localhost PostgreSQL from Docker, use `host.docker.internal` as the Host
- Check your PostgreSQL is running: `pg_isready`
- Verify PostgreSQL allows connections from Docker:
  - Edit `pg_hba.conf` to allow connections from Docker network
  - Restart PostgreSQL after changes
- Check firewall settings

### AI Analysis Issues

**Problem**: "AI analysis failed" or empty suggestions

**Solutions**:
- Verify your `GEMINI_API_KEY` in `backend/.env` is correct
- Check API key has not exceeded quota at [Google AI Studio](https://aistudio.google.com/)
- Check backend logs: `docker logs postgresql_optimizater_backend`

### Frontend Issues

**Problem**: 404 errors or "Cannot connect to backend"

**Solutions**:
- Ensure backend is running: `docker ps`
- Verify `frontend/.env` has `REACT_APP_BACKEND_URL=http://localhost:8000`
- Check backend health: Visit [http://localhost:8000/docs](http://localhost:8000/docs)
- Clear browser cache and reload

### Docker Issues

**Problem**: Container won't start or build errors

**Solutions**:
- Ensure Docker Desktop is running
- Try rebuilding: `docker-compose down && docker-compose up --build`
- Check Docker logs: `docker-compose logs`
- Ensure ports 3000 and 8000 are not in use

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style guidelines

### Quick Start for Contributors
```bash
# Fork and clone
git clone https://github.com/SivanSakthivel/QueryLens.git
cd QueryLens

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and test
docker-compose up --build

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Open a Pull Request
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini 2.5 Flash** for powering the AI analysis
- **React Flow** for the beautiful query plan visualization
- **FastAPI** for the robust backend framework
- **Hat AI-thon** for the inspiration and opportunity

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SivanSakthivel/QueryLens/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SivanSakthivel/QueryLens/discussions)

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ for the Hat AI-thon** | [Report Bug](https://github.com/SivanSakthivel/QueryLens/issues) | [Request Feature](https://github.com/SivanSakthivel/QueryLens/issues)
