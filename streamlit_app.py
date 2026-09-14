"""SDLC Agents — Streamlit console.

Runs the platform's four-agent CrewAI pipeline (Project Manager -> Developer ->
QA Engineer -> Technical Writer) as a sequential crew against a user-supplied
project description and renders each deliverable. Mirrors the agent roster in
AGENTS/crew_manager.py on the current CrewAI API so it deploys cleanly to
Streamlit Community Cloud.

Secrets: OPENAI_API_KEY (Streamlit secrets or environment).
"""

import os

import streamlit as st

st.set_page_config(page_title="SDLC Agents Platform", page_icon="🛠️", layout="wide")

st.title("🛠️ SDLC Agents Platform")
st.caption(
    "Four-agent CrewAI pipeline: Project Manager → Developer → QA Engineer → "
    "Technical Writer, executed sequentially over your project description."
)

ROSTER = [
    ("Project Manager", "Create a detailed, actionable project plan",
     "Experienced project manager who breaks work into phases, milestones, and risks."),
    ("Senior Developer", "Design the core implementation approach",
     "Pragmatic senior engineer who outlines architecture, key modules, and code structure."),
    ("QA Engineer", "Define the test strategy and test cases",
     "Quality engineer who writes concrete test cases, edge cases, and acceptance criteria."),
    ("Technical Writer", "Produce clear developer and user documentation",
     "Documentation specialist who turns technical output into structured docs."),
]

with st.sidebar:
    st.subheader("Agent roster")
    for name, goal, _ in ROSTER:
        st.markdown(f"**{name}** — {goal}")
    st.divider()
    st.caption("Sequential CrewAI crew · allow_delegation=False · gpt-4o-mini")

api_key = os.getenv("OPENAI_API_KEY") or st.secrets.get("OPENAI_API_KEY", "")
if not api_key:
    st.warning("Set OPENAI_API_KEY in Streamlit secrets to run the crew.")

description = st.text_area(
    "Project description", height=120,
    placeholder="e.g., Build a REST API for task management with user auth and reporting",
)

if st.button("Run SDLC crew", type="primary", disabled=not (description.strip() and api_key)):
    os.environ["OPENAI_API_KEY"] = api_key
    try:
        from crewai import Agent, Crew, Process, Task

        agents, tasks = [], []
        outputs_spec = [
            "A phased project plan with milestones, deliverables, and risks.",
            "An implementation outline: architecture, modules, and key code structure.",
            "A test strategy with concrete test cases and acceptance criteria.",
            "Developer and user documentation for the deliverable.",
        ]
        task_verbs = [
            "Create a detailed project plan for",
            "Design and outline the core implementation for",
            "Create the test strategy and test cases for",
            "Write comprehensive documentation for",
        ]
        for (name, goal, backstory), spec, verb in zip(ROSTER, outputs_spec, task_verbs):
            agent = Agent(
                role=name, goal=goal, backstory=backstory,
                verbose=False, allow_delegation=False, llm="gpt-4o-mini",
            )
            agents.append(agent)
            tasks.append(Task(
                description=f"{verb}: {description.strip()}",
                expected_output=spec, agent=agent,
            ))

        crew = Crew(agents=agents, tasks=tasks, process=Process.sequential, verbose=False)
        with st.spinner("Crew running — four agents in sequence (1–3 minutes)…"):
            result = crew.kickoff()

        labels = ["📋 Project Plan", "💻 Implementation", "🧪 Test Strategy", "📚 Documentation"]
        tabs = st.tabs(labels)
        task_outputs = getattr(result, "tasks_output", None) or []
        for tab, label, out in zip(tabs, labels, task_outputs):
            with tab:
                st.markdown(getattr(out, "raw", str(out)))
        if not task_outputs:
            st.markdown(str(result))
        st.success("Crew complete — four deliverables generated.")
    except Exception as exc:  # noqa: BLE001 - surface failures to the viewer
        st.error(f"Crew execution failed: {exc}")

with st.expander("About this platform"):
    st.markdown(
        "This console fronts the SDLC Agents Platform in this repository: a FastAPI "
        "project/task/document API, this CrewAI multi-agent pipeline, and a ChromaDB "
        "retrieval layer (see AGENTS/, API/, RAG/). The console runs the crew in-process "
        "for demonstration; the platform serves it behind the API."
    )
