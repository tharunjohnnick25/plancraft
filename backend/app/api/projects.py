from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.services.project_service import ProjectService
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("")
async def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    return await service.get_projects(current_user.id, page, per_page, status)


@router.post("", status_code=201)
async def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.create_project(current_user.id, req)
    return {"project": project}


@router.get("/{project_id}")
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.get_project(project_id, current_user.id)
    return {"project": project}


@router.patch("/{project_id}")
async def update_project(
    project_id: str,
    req: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.update_project(project_id, current_user.id, req)
    return {"project": project}


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    return await service.delete_project(project_id, current_user.id)


@router.post("/{project_id}/duplicate", status_code=201)
async def duplicate_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project = await service.duplicate_project(project_id, current_user.id)
    return {"project": project}


@router.post("/{project_id}/generate")
async def generate_plan(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProjectService(db)
    project_dict = await service.get_project(project_id, current_user.id)

    from app.ai.engine import ArchitectEngine
    from app.models.room import Room
    from app.models.project import Project
    from sqlalchemy import select

    engine = ArchitectEngine()
    plan = engine.generate_plan({
        "plot_length": project_dict["plot_length"],
        "plot_width": project_dict["plot_width"],
        "facing": project_dict["facing"],
        "floors": project_dict["floors"],
        "budget_tier": project_dict["budget_tier"],
        "style": project_dict["style"],
        "vastu": project_dict["vastu"],
        "bedrooms": sum(1 for r in project_dict.get("rooms", []) if r.get("type") == "bedroom") or 3,
        "bathrooms": sum(1 for r in project_dict.get("rooms", []) if r.get("type") == "bathroom") or 2,
        "kitchens": 1,
        "parking": 1,
        "garden": False,
    })

    for room_data in plan["rooms"]:
        room = Room(
            project_id=project_id,
            name=room_data["name"],
            width=room_data["width"],
            length=room_data["length"],
            level=room_data.get("level", 0),
            x=room_data.get("x", 0),
            y=room_data.get("y", 0),
            room_type=room_data.get("type", "room"),
            color=room_data.get("color", "#f8fafc"),
        )
        db.add(room)

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        project.cost_estimate = plan["costEstimate"]
        project.vastu_score = int(plan["scores"].get("vastu_score", 0))
        project.sustainability_score = plan.get("sustainabilityScore")

    await db.flush()

    updated = await service.get_project(project_id, current_user.id)
    return {"project": updated, "plan": plan}
