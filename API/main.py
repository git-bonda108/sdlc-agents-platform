
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from MODELS.database import get_db, Project, Task, Document, Agent
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="Enhanced Agentic AI SDLC System",
    description="A comprehensive SDLC system with AI agents and RAG capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    priority: Optional[str] = "medium"

class DocumentCreate(BaseModel):
    title: str
    content: str
    project_id: int

class AgentCreate(BaseModel):
    name: str
    role: str
    description: Optional[str] = None
    config: Optional[str] = None

# Routes
@app.get("/")
async def root():
    return {"message": "Enhanced Agentic AI SDLC System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SDLC API"}

# Project endpoints
@app.post("/projects/")
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects/")
async def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@app.get("/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# Task endpoints
@app.post("/tasks/")
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/tasks/")
async def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.get("/tasks/{task_id}")
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# Document endpoints
@app.post("/documents/")
async def create_document(document: DocumentCreate, db: Session = Depends(get_db)):
    db_document = Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

@app.get("/documents/")
async def get_documents(db: Session = Depends(get_db)):
    return db.query(Document).all()

# Agent endpoints
@app.post("/agents/")
async def create_agent(agent: AgentCreate, db: Session = Depends(get_db)):
    db_agent = Agent(**agent.dict())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.get("/agents/")
async def get_agents(db: Session = Depends(get_db)):
    return db.query(Agent).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
