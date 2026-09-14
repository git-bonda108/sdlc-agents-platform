
from crewai import Agent, Task, Crew
from crewai.tools import BaseTool
from typing import List, Dict, Any
import os

class SDLCAgent:
    """Base class for SDLC agents"""
    
    def __init__(self, name: str, role: str, goal: str, backstory: str):
        self.name = name
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.agent = Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            verbose=True,
            allow_delegation=False
        )

class ProjectManagerAgent(SDLCAgent):
    """Agent responsible for project management tasks"""
    
    def __init__(self):
        super().__init__(
            name="Project Manager",
            role="Project Manager",
            goal="Coordinate project activities and ensure timely delivery",
            backstory="You are an experienced project manager with expertise in agile methodologies and team coordination."
        )

class DeveloperAgent(SDLCAgent):
    """Agent responsible for development tasks"""
    
    def __init__(self):
        super().__init__(
            name="Developer",
            role="Software Developer",
            goal="Write high-quality code and implement features",
            backstory="You are a skilled software developer with expertise in multiple programming languages and frameworks."
        )

class QAAgent(SDLCAgent):
    """Agent responsible for quality assurance"""
    
    def __init__(self):
        super().__init__(
            name="QA Engineer",
            role="Quality Assurance Engineer",
            goal="Ensure software quality through testing and validation",
            backstory="You are a meticulous QA engineer with expertise in testing methodologies and automation."
        )

class DocumentationAgent(SDLCAgent):
    """Agent responsible for documentation"""
    
    def __init__(self):
        super().__init__(
            name="Technical Writer",
            role="Technical Writer",
            goal="Create comprehensive and clear documentation",
            backstory="You are a technical writer with expertise in creating user-friendly documentation and guides."
        )

class CrewManager:
    """Manages the crew of SDLC agents"""
    
    def __init__(self):
        self.project_manager = ProjectManagerAgent()
        self.developer = DeveloperAgent()
        self.qa_engineer = QAAgent()
        self.tech_writer = DocumentationAgent()
        
        self.agents = [
            self.project_manager.agent,
            self.developer.agent,
            self.qa_engineer.agent,
            self.tech_writer.agent
        ]
    
    def create_development_crew(self, project_description: str) -> Crew:
        """Create a crew for development tasks"""
        
        # Define tasks
        planning_task = Task(
            description=f"Create a detailed project plan for: {project_description}",
            agent=self.project_manager.agent
        )
        
        development_task = Task(
            description=f"Develop the core functionality for: {project_description}",
            agent=self.developer.agent
        )
        
        testing_task = Task(
            description=f"Create and execute test cases for: {project_description}",
            agent=self.qa_engineer.agent
        )
        
        documentation_task = Task(
            description=f"Create comprehensive documentation for: {project_description}",
            agent=self.tech_writer.agent
        )
        
        # Create crew
        crew = Crew(
            agents=self.agents,
            tasks=[planning_task, development_task, testing_task, documentation_task],
            verbose=True
        )
        
        return crew
    
    def execute_project(self, project_description: str) -> Dict[str, Any]:
        """Execute a complete project workflow"""
        crew = self.create_development_crew(project_description)
        result = crew.kickoff()
        return result

# Example usage
if __name__ == "__main__":
    manager = CrewManager()
    result = manager.execute_project("Build a REST API for task management")
    print(result)
