"""
Authentication utilities and dependencies
"""
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
from typing import Optional
from .config import db, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user"""
    from .models.user import User
    
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**{k: v for k, v in user_doc.items() if k != "password"})

async def require_super_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Require SuperAdmin role"""
    user = await get_current_user(credentials)
    if user.role != "SuperAdmin":
        raise HTTPException(status_code=403, detail="SuperAdmin access required")
    return user
