from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def signup(self, req: SignupRequest) -> dict:
        existing = await self.db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        
        user = User(
            name=req.name,
            email=req.email,
            password=hash_password(req.password),
            role="user",
            verified=False,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        
        access_token = create_access_token(user.id, user.role)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "user": self._user_to_dict(user),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def login(self, req: LoginRequest) -> dict:
        result = await self.db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                name=req.email.split("@")[0],
                email=req.email,
                password=hash_password(""),
                role="user",
                verified=True,
                is_active=True,
            )
            self.db.add(user)
            await self.db.flush()
            await self.db.refresh(user)
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        
        access_token = create_access_token(user.id, user.role)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "user": self._user_to_dict(user),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def get_current_user(self, user_id: str) -> dict:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return self._user_to_dict(user)

    async def reset_password(self, email: str, new_password: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.password = hash_password(new_password)
        await self.db.flush()
        return {"success": True}

    async def verify_email(self, email: str) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.verified = True
        await self.db.flush()
        return {"success": True}

    async def update_user(self, user_id: str, updates: dict) -> dict:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        for key, value in updates.items():
            if value is not None and hasattr(user, key):
                setattr(user, key, value)
        
        await self.db.flush()
        await self.db.refresh(user)
        return self._user_to_dict(user)

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
        user_id = payload.get("sub")
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
        new_access = create_access_token(user.id, user.role)
        new_refresh = create_refresh_token(user.id)
        
        return {"access_token": new_access, "refresh_token": new_refresh}

    def _user_to_dict(self, user: User) -> dict:
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "plan": user.plan,
            "verified": user.verified,
            "is_active": user.is_active,
            "company": user.company,
            "country": user.country,
            "phone": user.phone,
            "bio": user.bio,
            "avatar": user.avatar,
            "ai_credits_used": user.ai_credits_used,
            "ai_credits_total": user.ai_credits_total,
            "storage_used_mb": user.storage_used_mb,
            "storage_quota_mb": user.storage_quota_mb,
            "projects_count": user.projects_count,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        }
