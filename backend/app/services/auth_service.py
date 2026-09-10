from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.services.audit_service import audit_service
from app.services.hash_service import hash_service

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        """Register a new user in the database."""
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )

        new_user = User(
            email=user_in.email.lower(),
            full_name=user_in.full_name,
            password_hash=hash_password(user_in.password),
            role=user_in.role.upper(),
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create audit event
        audit_service.create_log(
            db=db,
            record_type="USER_REGISTERED",
            asset_id=new_user.id,
            hash_value=hash_service.calculate_sha256_str(f"{new_user.id}:{new_user.email}"),
            version="v1.0",
            contributor_name=new_user.full_name,
            status="VERIFIED",
            metadata_json={"email": new_user.email, "role": new_user.role}
        )

        return new_user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> TokenResponse:
        """Authenticate user credentials and issue JWT."""
        user = db.query(User).filter(User.email == login_data.email.lower()).first()
        if not user or not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account."
            )

        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role}
        )

        # Audit log for login
        audit_service.create_log(
            db=db,
            record_type="USER_LOGIN",
            asset_id=user.id,
            hash_value=hash_service.calculate_sha256_str(f"{user.id}:{datetime.now(timezone.utc).isoformat()}"),
            version="v1.0",
            contributor_name=user.full_name,
            status="VERIFIED"
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

auth_service = AuthService()
