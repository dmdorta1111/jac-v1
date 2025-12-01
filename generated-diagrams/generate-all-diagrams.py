"""
JAC-V1 Architecture Diagrams Generator
Run: pip install diagrams && python generate-all-diagrams.py
Output: 4 PNG files in current directory
"""

import os
import sys

# Add Graphviz to PATH on Windows
graphviz_path = r"C:\Program Files\Graphviz\bin"
if os.path.exists(graphviz_path):
    os.environ["PATH"] = graphviz_path + os.pathsep + os.environ.get("PATH", "")

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import React, NextJs
from diagrams.programming.language import NodeJS, TypeScript, Javascript
from diagrams.onprem.client import User
from diagrams.onprem.database import MongoDB
from diagrams.aws.ml import Bedrock
from diagrams.programming.flowchart import Action, Decision, StartEnd, InputOutput

# Phase 1: System Architecture
with Diagram("JAC-V1 System Architecture", show=False, direction="LR", filename="phase-01-system-architecture"):
    user = User("User")

    with Cluster("Frontend (Next.js 15)"):
        nextjs = NextJs("Next.js App")
        components = React("UI Components")
        threejs = React("Three.js 3D")

    with Cluster("API Layer"):
        api_form = NodeJS("/api/form-submission")
        api_chat = NodeJS("/api/chat")
        api_projects = NodeJS("/api/projects")

    with Cluster("Business Logic"):
        flow_engine = TypeScript("FlowEngine")
        zod = TypeScript("Zod Validator")
        evaluator = TypeScript("Conditional Evaluator")

    with Cluster("Data Layer"):
        mongo_projects = MongoDB("projects")
        mongo_items = MongoDB("items")
        mongo_forms = MongoDB("form_submissions")

    claude = Bedrock("Claude API")

    user >> Edge(label="browse") >> nextjs
    nextjs >> components
    components >> threejs

    components >> Edge(label="fetch") >> api_form
    components >> Edge(label="chat") >> api_chat
    components >> Edge(label="GET") >> api_projects

    api_form >> Edge(label="validate") >> zod
    zod >> Edge(label="execute") >> flow_engine
    flow_engine >> Edge(label="evaluate") >> evaluator

    api_form >> Edge(label="save") >> mongo_forms
    api_projects >> Edge(label="query") >> mongo_projects
    flow_engine >> Edge(label="reference") >> mongo_items

    api_chat >> Edge(label="prompt") >> claude
    claude >> Edge(label="response") >> api_chat

print("[OK] Phase 1: System Architecture generated")

# Phase 2: Database Schema
with Diagram("JAC-V1 Database Schema", show=False, direction="LR", filename="phase-02-database-schema"):
    with Cluster("MongoDB Collections"):
        projects = MongoDB("projects\n_id (PK)\nsalesOrderNumber\njobName")
        items = MongoDB("items\n_id (PK)\nprojectId (FK)\nitemNumber")
        forms = MongoDB("form_submissions\nsessionId\nprojectId (FK)\nitemId (FK)\nformData")

    templates = Javascript("Form Templates\n(JSON files)\n57 templates")

    projects >> Edge(label="1:N", style="bold") >> items
    projects >> Edge(label="1:N", style="bold") >> forms
    items >> Edge(label="1:N", style="bold") >> forms
    forms >> Edge(label="references", style="dashed") >> templates

print("[OK] Phase 2: Database Schema generated")

# Phase 3: Form Flow
with Diagram("JAC-V1 Form Flow Execution", show=False, direction="LR", filename="phase-03-form-flow"):
    start = StartEnd("Start:\nproject-header")

    with Cluster("Phase 1: Initialization"):
        load_project = Action("Load Project")
        check_opening = Decision("OPENING_TYPE?")

    with Cluster("Phase 2: Data Collection"):
        options_form = InputOutput("Options Form")
        door_branch = Action("Door Info\n(type=1,3)")
        frame_branch = Action("Frame Info\n(type=2,3,4)")
        hardware_check = Decision("Hardware\nEnabled?")
        hardware_forms = InputOutput("Locks/Hinges/Closers\n(15 forms)")

    with Cluster("Phase 3: Model Building"):
        build_door = Action("Door Assembly\nModel")
        build_frame = Action("Frame Assembly\nModel")

    with Cluster("Phase 4: Drawing Generation"):
        creo_drawing = Action("Creo Drawing\nGeneration")

    with Cluster("Phase 5: Export"):
        bom_export = Action("BOM Export")
        smartassembly = Action("SmartAssembly\nData")

    end = StartEnd("End:\nComplete")

    start >> load_project >> check_opening
    check_opening >> Edge(label="1,3 (door)") >> door_branch
    check_opening >> Edge(label="2,3,4 (frame)") >> frame_branch
    door_branch >> options_form
    frame_branch >> options_form
    options_form >> hardware_check
    hardware_check >> Edge(label="yes") >> hardware_forms
    hardware_check >> Edge(label="no") >> build_door
    hardware_forms >> build_door
    build_door >> build_frame
    build_frame >> creo_drawing
    creo_drawing >> bom_export
    bom_export >> smartassembly >> end

print("[OK] Phase 3: Form Flow generated")

# Phase 4: Component Relationships
with Diagram("JAC-V1 Component Relationships", show=False, direction="LR", filename="phase-04-component-relationships"):
    with Cluster("Flow Orchestration"):
        claude_chat = React("ClaudeChat.tsx\n(orchestrator)")

    with Cluster("Form Rendering"):
        form_renderer = React("DynamicFormRenderer.tsx")
        conditional_eval = TypeScript("Conditional\nEvaluator")
        zod_builder = TypeScript("Zod Schema\nBuilder")

    with Cluster("State Management"):
        flow_engine = TypeScript("FlowEngine\n(executor.ts)")
        safe_eval = TypeScript("safeEval()\n(evaluator.ts)")

    with Cluster("Data Sources"):
        form_templates = Javascript("Form Templates\n(57 JSON files)")
        flow_defs = Javascript("Flow Definition\n(SDI-form-flow.json)")

    claude_chat >> Edge(label="load") >> flow_defs
    claude_chat >> Edge(label="initialize") >> flow_engine
    flow_engine >> Edge(label="evaluate") >> safe_eval
    flow_engine >> Edge(label="next step") >> claude_chat

    claude_chat >> Edge(label="render") >> form_renderer
    form_renderer >> Edge(label="load template") >> form_templates
    form_renderer >> Edge(label="check visibility") >> conditional_eval
    conditional_eval >> Edge(label="read state") >> flow_engine

    form_renderer >> Edge(label="submit") >> zod_builder
    zod_builder >> Edge(label="validate with context") >> flow_engine
    zod_builder >> Edge(label="success/errors") >> claude_chat

print("[OK] Phase 4: Component Relationships generated")
print("\n[SUCCESS] All diagrams generated successfully!")
print("Files created:")
print("  - phase-01-system-architecture.png")
print("  - phase-02-database-schema.png")
print("  - phase-03-form-flow.png")
print("  - phase-04-component-relationships.png")
