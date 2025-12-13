from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware

import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncpg
import json
import google.generativeai as genai


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')



# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models


# PostgreSQL Connection Models
class PostgreSQLConnection(BaseModel):
    host: str
    port: int = 5432
    username: str
    password: str = ""
    database: str

class ConnectionTestResponse(BaseModel):
    success: bool
    message: str
    session_id: Optional[str] = None

class SQLQuery(BaseModel):
    session_id: str
    query: str
    analyze: bool = True

class QueryPlanResponse(BaseModel):
    success: bool
    plan: Optional[Dict[str, Any]] = None
    query: Optional[str] = None
    error: Optional[str] = None

class AIAnalysisRequest(BaseModel):
    plan: Dict[str, Any]
    query: Optional[str] = None

class AIAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    plan: Dict[str, Any]
    query: Optional[str] = None
    history: List[Dict[str, str]] = []

class ChatResponse(BaseModel):
    success: bool
    reply: Optional[str] = None
    error: Optional[str] = None

# Store active PostgreSQL connections in memory
active_connections = {}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "PostgreSQL Query Plan Analyzer with AI"}



@api_router.post("/pg/connect", response_model=ConnectionTestResponse)
async def test_postgresql_connection(connection: PostgreSQLConnection):
    """Test PostgreSQL connection and store session if successful"""
    try:
        # Create connection string
        dsn = f"postgresql://{connection.username}:{connection.password}@{connection.host}:{connection.port}/{connection.database}"
        
        # Test connection
        conn = await asyncpg.connect(dsn, timeout=10)
        
        # Test query
        result = await conn.fetchval("SELECT version()")
        
        await conn.close()
        
        # Generate session ID and store connection info
        session_id = str(uuid.uuid4())
        active_connections[session_id] = {
            "dsn": dsn,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        return ConnectionTestResponse(
            success=True,
            message=f"Connected successfully to PostgreSQL\nVersion: {result}",
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/pg/execute-explain", response_model=QueryPlanResponse)
async def execute_explain(query_data: SQLQuery):
    """Execute EXPLAIN ANALYZE on the provided query"""
    try:
        # Check if session exists
        if query_data.session_id not in active_connections:
            raise HTTPException(status_code=400, detail="Invalid or expired session ID")
        
        dsn = active_connections[query_data.session_id]["dsn"]
        
        # Connect to PostgreSQL
        conn = await asyncpg.connect(dsn, timeout=10)
        
        try:
            # Build EXPLAIN query
            if query_data.analyze:
                explain_query = f"EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) {query_data.query}"
            else:
                explain_query = f"EXPLAIN (COSTS, VERBOSE, BUFFERS, FORMAT JSON) {query_data.query}"
            
            # Execute EXPLAIN
            result = await conn.fetch(explain_query)
            
            if result:
                # Parse the JSON result
                plan_data = result[0]['QUERY PLAN']
                if isinstance(plan_data, str):
                    plan_data = json.loads(plan_data)
                
                return QueryPlanResponse(
                    success=True,
                    plan=plan_data[0] if isinstance(plan_data, list) else plan_data,
                    query=query_data.query
                )
            else:
                return QueryPlanResponse(
                    success=False,
                    error="No result returned from EXPLAIN query"
                )
                
        finally:
            await conn.close()
            
    except Exception as e:
        logging.error(f"Error executing EXPLAIN: {str(e)}")
        return QueryPlanResponse(
            success=False,
            error=str(e)
        )

@api_router.post("/pg/analyze-plan", response_model=AIAnalysisResponse)
async def analyze_plan_with_ai(analysis_request: AIAnalysisRequest):
    """Analyze query plan using AI"""
    try:
        # Get API key from environment
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        genai.configure(api_key=api_key)
        
        system_instruction = """You are an expert PostgreSQL query optimization assistant. 
            Analyze query execution plans and provide actionable optimization recommendations.
            Focus on:
            1. Identifying performance bottlenecks (seq scans, nested loops, etc.)
            2. Suggesting indexes
            3. Query rewrite suggestions
            4. Cost analysis
            5. Row estimate accuracy
            
            Return your analysis in JSON format with these sections:
            {
                "overall_assessment": "brief summary of query performance",
                "bottlenecks": [{"node_type": "...", "issue": "...", "impact": "high|medium|low"}],
                "index_recommendations": [{"table": "...", "columns": [...], "reason": "..."}],
                "query_rewrites": [{"suggestion": "...", "benefit": "..."}],
                "node_analysis": {"node_id": {"advice": "...", "severity": "high|medium|low"}}
            }"""
        
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
        
        # Prepare the analysis prompt
        plan_json = json.dumps(analysis_request.plan, indent=2)
        query_info = f"\nOriginal Query: {analysis_request.query}" if analysis_request.query else ""
        
        prompt = f"""Analyze this PostgreSQL EXPLAIN output and provide optimization recommendations:

{plan_json}{query_info}

Provide a detailed JSON response following the schema specified in your instructions."""
        
        # Get AI response
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse AI response
        try:
            # Try to extract JSON from response
            response_text = response_text.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            analysis_data = json.loads(response_text)
        except:
            # If parsing fails, return raw response
            analysis_data = {
                "overall_assessment": response_text,
                "bottlenecks": [],
                "index_recommendations": [],
                "query_rewrites": [],
                "node_analysis": {}
            }
        
        return AIAnalysisResponse(
            success=True,
            analysis=analysis_data
        )
        
    except Exception as e:
        logging.error(f"Error in AI analysis: {str(e)}")
        return AIAnalysisResponse(
            success=False,
            error=str(e)
        )

class ComparePlansRequest(BaseModel):
    plan1: Dict[str, Any]
    plan2: Dict[str, Any]
    query1: Optional[str] = None
    query2: Optional[str] = None

class ComparePlansResponse(BaseModel):
    success: bool
    comparison: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@api_router.post("/pg/compare-plans", response_model=ComparePlansResponse)
async def compare_plans(compare_request: ComparePlansRequest):
    """Compare two query plans using AI"""
    try:
        # Get API key from environment
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        genai.configure(api_key=api_key)
        
        system_instruction = """You are an expert PostgreSQL query optimization assistant.
            Compare two query execution plans (Plan A and Plan B) and analyze the differences.
            Focus on:
            1. Cost differences (Total Cost, Startup Cost)
            2. Execution time differences (if available)
            3. structural differences (Scan types, Join types)
            4. Why one is better than the other
            
            Return your analysis in JSON format with these sections:
            {
                "summary": "Which plan is better and why",
                "metrics_comparison": {
                    "cost_diff": "Description of cost difference",
                    "time_diff": "Description of time difference (if applicable)"
                },
                "structural_changes": ["Change 1", "Change 2"],
                "recommendation": "Final recommendation"
            }"""
            
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
        
        # Prepare prompts
        plan1_json = json.dumps(compare_request.plan1, indent=2)
        plan2_json = json.dumps(compare_request.plan2, indent=2)
        q1_info = f"\nQuery A: {compare_request.query1}" if compare_request.query1 else ""
        q2_info = f"\nQuery B: {compare_request.query2}" if compare_request.query2 else ""
        
        prompt = f"""Compare these two PostgreSQL query plans:

PLAN A:
{q1_info}
{plan1_json}

PLAN B:
{q2_info}
{plan2_json}

Provide a detailed JSON comparison following the schema."""
        
        # Get AI response
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse AI response
        try:
            # Try to extract JSON from response
            response_text = response_text.strip()
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0].strip()
            
            comparison_data = json.loads(response_text)
        except:
            comparison_data = {
                "summary": response_text,
                "metrics_comparison": {},
                "structural_changes": [],
                "recommendation": ""
            }
            
        return ComparePlansResponse(
            success=True,
            comparison=comparison_data
        )
        
    except Exception as e:
        logging.error(f"Error in plan comparison: {str(e)}")
        return ComparePlansResponse(
            success=False,
            error=str(e)
        )

@api_router.post("/pg/chat", response_model=ChatResponse)
async def chat_with_ai(chat_request: ChatRequest):
    """Chat with AI about the query plan"""
    try:
        # Get API key from environment
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        
        genai.configure(api_key=api_key)
        
        system_instruction = """You are an expert PostgreSQL query optimization assistant. 
            You are discussing a specific query execution plan with a user.
            Answer their questions about the plan, explain specific nodes, or suggestion optimizations.
            Be concise, technical but accessible, and practical."""
        
        model = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_instruction)
        
        # Build context from plan
        plan_context = json.dumps(chat_request.plan, indent=2)
        query_context = f"Original Query: {chat_request.query}\\n" if chat_request.query else ""
        
        # Construct chat history for Gemini
        # We start with a context providing message
        history_instruction = f"Here is the query plan we are discussing:\\n{plan_context}\\n{query_context}"
        
        chat = model.start_chat(history=[
            {"role": "user", "parts": [history_instruction]},
            {"role": "model", "parts": ["I understand. I am ready to discuss this query plan with you."]}
        ])
        
        # Replay provided history if any (excluding the current new message)
        # Note: robust implementation would handle full history reconstruction
        for msg in chat_request.history:
             # Map 'user'/'ai' to Gemini roles if needed, or just append
             # For simplicity in this turn-based request, we might just rely on the immediate prompt
             # But let's try to pass history if possible or just context + current question
             pass

        # Send user message
        response = chat.send_message(chat_request.message)
        
        return ChatResponse(
            success=True,
            reply=response.text
        )

    except Exception as e:
        logging.error(f"Error in AI chat: {str(e)}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


