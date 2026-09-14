
import pytest
from fastapi.testclient import TestClient
from API.main import app

client = TestClient(app)

def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Enhanced Agentic AI SDLC System API" in response.json()["message"]

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_project():
    """Test project creation"""
    project_data = {
        "name": "Test Project",
        "description": "A test project"
    }
    response = client.post("/projects/", json=project_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Project"

def test_get_projects():
    """Test getting all projects"""
    response = client.get("/projects/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_task():
    """Test task creation"""
    # First create a project
    project_data = {"name": "Test Project", "description": "Test"}
    project_response = client.post("/projects/", json=project_data)
    project_id = project_response.json()["id"]
    
    # Then create a task
    task_data = {
        "title": "Test Task",
        "description": "A test task",
        "project_id": project_id
    }
    response = client.post("/tasks/", json=task_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"

def test_get_tasks():
    """Test getting all tasks"""
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_document():
    """Test document creation"""
    # First create a project
    project_data = {"name": "Test Project", "description": "Test"}
    project_response = client.post("/projects/", json=project_data)
    project_id = project_response.json()["id"]
    
    # Then create a document
    doc_data = {
        "title": "Test Document",
        "content": "This is test content",
        "project_id": project_id
    }
    response = client.post("/documents/", json=doc_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Document"

def test_create_agent():
    """Test agent creation"""
    agent_data = {
        "name": "Test Agent",
        "role": "Developer",
        "description": "A test agent"
    }
    response = client.post("/agents/", json=agent_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Test Agent"

if __name__ == "__main__":
    pytest.main([__file__])
