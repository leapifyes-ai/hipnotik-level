from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import io
import csv
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'hipnotik-level-stand-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== AUTH MODELS ====================

class UserRole(str):
    SUPER_ADMIN = "SuperAdmin"
    EMPLEADO = "Empleado"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["SuperAdmin", "Empleado"] = "Empleado"
    language: Literal["es", "ca", "en"] = "es"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    language: str = "es"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_demo: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

# ==================== CLIENT MODELS ====================

class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_demo: bool = False

# ==================== SALE MODELS ====================

class MobileLineData(BaseModel):
    number: str
    type: Literal["Postpago", "Prepago"]
    iccid: Optional[str] = None
    origin_company: Optional[str] = None

class FiberData(BaseModel):
    address: Optional[str] = None
    speed: Optional[str] = None

class SaleCreate(BaseModel):
    client_id: Optional[str] = None
    client_data: Optional[ClientCreate] = None
    company: str
    pack_type: Literal["Solo Móvil", "Solo Fibra", "Pack Fibra + Móvil"]
    pack_id: Optional[str] = None
    mobile_lines: Optional[List[MobileLineData]] = None
    fiber: Optional[FiberData] = None

class Sale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    company: str
    pack_type: str
    pack_id: Optional[str] = None
    mobile_lines: Optional[List[Dict]] = None
    fiber: Optional[Dict] = None
    status: str = "Registrado"
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_demo: bool = False

# ==================== PACK/TARIFA MODELS ====================

class PackCreate(BaseModel):
    company: str
    name: str
    type: Literal["Solo Móvil", "Solo Fibra", "Pack Fibra + Móvil", "Pack Fibra + Móvil + TV"]
    price: float
    features: str
    validity_start: Optional[datetime] = None
    validity_end: Optional[datetime] = None
    active: bool = True
    observations: Optional[str] = None
    # Configurator fields
    category: Optional[str] = None  # mobile_only/fiber_only/bundle/bundle_tv
    fiber_speed_mbps: Optional[int] = None
    mobile_gb: Optional[int] = None
    minutes_type: Optional[str] = None  # ilimitadas/limitadas
    lines_included: int = 1
    additional_lines_supported: bool = False
    tv_supported: bool = False
    tv_package_type: Optional[str] = None  # basic/sports/streaming/other
    restrictions: Optional[str] = None

class Pack(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company: str
    name: str
    type: str
    price: float
    features: str
    validity_start: Optional[datetime] = None
    validity_end: Optional[datetime] = None
    active: bool = True
    observations: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_demo: bool = False
    is_new: bool = False
    # Configurator fields
    category: Optional[str] = None
    fiber_speed_mbps: Optional[int] = None
    mobile_gb: Optional[int] = None
    minutes_type: Optional[str] = None
    lines_included: int = 1
    additional_lines_supported: bool = False
    tv_supported: bool = False
    tv_package_type: Optional[str] = None
    restrictions: Optional[str] = None

# ==================== INCIDENT MODELS ====================

class IncidentCreate(BaseModel):
    client_id: str
    title: str
    description: str
    priority: Literal["Baja", "Media", "Alta", "Crítica"] = "Media"
    type: str
    assigned_to: Optional[str] = None

class Incident(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    description: str
    priority: str
    type: str
    status: str = "Abierta"
    assigned_to: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_demo: bool = False

class IncidentComment(BaseModel):
    incident_id: str
    comment: str
    user_id: str
    user_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== OBJECTIVE MODELS ====================

class ObjectiveCreate(BaseModel):
    month: int
    year: int
    team_target: int
    employee_targets: Optional[Dict[str, int]] = None
    company_targets: Optional[Dict[str, int]] = None

class Objective(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: int
    year: int
    team_target: int
    employee_targets: Optional[Dict[str, int]] = None
    company_targets: Optional[Dict[str, int]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== FICHAJE MODELS ====================

class FichajeCreate(BaseModel):
    type: Literal["Entrada", "Salida"]

class Fichaje(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== CONTACT MODELS ====================

class ContactCreate(BaseModel):
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== NOTIFICATION MODELS ====================

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_super_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "SuperAdmin":
        raise HTTPException(status_code=403, detail="SuperAdmin access required")
    return user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Count users
    user_count = await db.users.count_documents({})
    if user_count >= 5:  # 1 SuperAdmin + 4 Empleados
        raise HTTPException(status_code=400, detail="Maximum user limit reached")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        language=user_data.language
    )
    
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(user: User = Depends(get_current_user)):
    return user

# ==================== CLIENT ENDPOINTS ====================

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, user: User = Depends(get_current_user)):
    # Check if client exists by phone
    existing = await db.clients.find_one({"phone": client_data.phone}, {"_id": 0})
    if existing:
        return Client(**existing)
    
    client = Client(**client_data.model_dump(), created_by=user.id)
    doc = client.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.clients.insert_one(doc)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(user: User = Depends(get_current_user), search: Optional[str] = None):
    query = {}
    if search:
        query = {"$or": [{"phone": {"$regex": search, "$options": "i"}}, {"name": {"$regex": search, "$options": "i"}}]}
    
    clients = await db.clients.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for c in clients:
        if isinstance(c["created_at"], str):
            c["created_at"] = datetime.fromisoformat(c["created_at"])
        if isinstance(c["updated_at"], str):
            c["updated_at"] = datetime.fromisoformat(c["updated_at"])
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, user: User = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if isinstance(client["created_at"], str):
        client["created_at"] = datetime.fromisoformat(client["created_at"])
    if isinstance(client["updated_at"], str):
        client["updated_at"] = datetime.fromisoformat(client["updated_at"])
    return Client(**client)

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate, user: User = Depends(get_current_user)):
    result = await db.clients.update_one(
        {"id": client_id},
        {"$set": {
            "name": client_data.name,
            "phone": client_data.phone,
            "email": client_data.email,
            "city": client_data.city,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if isinstance(client["created_at"], str):
        client["created_at"] = datetime.fromisoformat(client["created_at"])
    if isinstance(client["updated_at"], str):
        client["updated_at"] = datetime.fromisoformat(client["updated_at"])
    return Client(**client)

# ==================== SALE ENDPOINTS ====================

@api_router.post("/sales", response_model=Sale)
async def create_sale(sale_data: SaleCreate, user: User = Depends(get_current_user)):
    # Handle client creation/update
    if sale_data.client_data:
        client = await create_client(sale_data.client_data, user)
        client_id = client.id
    elif sale_data.client_id:
        client_id = sale_data.client_id
    else:
        raise HTTPException(status_code=400, detail="Client data or ID required")
    
    sale = Sale(
        client_id=client_id,
        company=sale_data.company,
        pack_type=sale_data.pack_type,
        pack_id=sale_data.pack_id,
        mobile_lines=[line.model_dump() for line in sale_data.mobile_lines] if sale_data.mobile_lines else None,
        fiber=sale_data.fiber.model_dump() if sale_data.fiber else None,
        created_by=user.id
    )
    
    doc = sale.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.sales.insert_one(doc)
    
    # Create notification
    notif = Notification(
        user_id="all",
        title="Nueva venta registrada",
        message=f"{user.name} ha registrado una venta de {sale.company}",
        type="new_sale"
    )
    notif_doc = notif.model_dump()
    notif_doc["created_at"] = notif_doc["created_at"].isoformat()
    await db.notifications.insert_one(notif_doc)
    
    return sale

@api_router.get("/sales", response_model=List[Sale])
async def get_sales(user: User = Depends(get_current_user)):
    query = {}
    if user.role == "Empleado":
        query = {"created_by": user.id}
    
    sales = await db.sales.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for s in sales:
        if isinstance(s["created_at"], str):
            s["created_at"] = datetime.fromisoformat(s["created_at"])
        if isinstance(s["updated_at"], str):
            s["updated_at"] = datetime.fromisoformat(s["updated_at"])
    return sales

@api_router.patch("/sales/{sale_id}/status")
async def update_sale_status(sale_id: str, status: str, user: User = Depends(get_current_user)):
    result = await db.sales.update_one(
        {"id": sale_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"message": "Status updated"}

# ==================== PACK ENDPOINTS ====================

@api_router.post("/packs", response_model=Pack)
async def create_pack(pack_data: PackCreate, user: User = Depends(require_super_admin)):
    pack = Pack(**pack_data.model_dump())
    pack.is_new = (datetime.now(timezone.utc) - pack.created_at).days < 7
    
    doc = pack.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    if doc.get("validity_start"):
        doc["validity_start"] = doc["validity_start"].isoformat()
    if doc.get("validity_end"):
        doc["validity_end"] = doc["validity_end"].isoformat()
    
    await db.packs.insert_one(doc)
    return pack

@api_router.get("/packs", response_model=List[Pack])
async def get_packs(user: User = Depends(get_current_user), active_only: bool = False):
    query = {}
    if active_only:
        query["active"] = True
    
    packs = await db.packs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for p in packs:
        if isinstance(p["created_at"], str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
        if p.get("validity_start") and isinstance(p["validity_start"], str):
            p["validity_start"] = datetime.fromisoformat(p["validity_start"])
        if p.get("validity_end") and isinstance(p["validity_end"], str):
            p["validity_end"] = datetime.fromisoformat(p["validity_end"])
        p["is_new"] = (datetime.now(timezone.utc) - p["created_at"]).days < 7
    return packs

@api_router.patch("/packs/{pack_id}")
async def update_pack(pack_id: str, pack_data: PackCreate, user: User = Depends(require_super_admin)):
    doc = pack_data.model_dump()
    if doc.get("validity_start"):
        doc["validity_start"] = doc["validity_start"].isoformat()
    if doc.get("validity_end"):
        doc["validity_end"] = doc["validity_end"].isoformat()
    
    result = await db.packs.update_one({"id": pack_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pack not found")
    return {"message": "Pack updated"}

# ==================== INCIDENT ENDPOINTS ====================

@api_router.post("/incidents", response_model=Incident)
async def create_incident(incident_data: IncidentCreate, user: User = Depends(get_current_user)):
    incident = Incident(**incident_data.model_dump(), created_by=user.id)
    doc = incident.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.incidents.insert_one(doc)
    return incident

@api_router.get("/incidents", response_model=List[Incident])
async def get_incidents(user: User = Depends(get_current_user)):
    query = {}
    if user.role == "Empleado":
        query = {"$or": [{"created_by": user.id}, {"assigned_to": user.id}]}
    
    incidents = await db.incidents.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for i in incidents:
        if isinstance(i["created_at"], str):
            i["created_at"] = datetime.fromisoformat(i["created_at"])
        if isinstance(i["updated_at"], str):
            i["updated_at"] = datetime.fromisoformat(i["updated_at"])
    return incidents

@api_router.post("/incidents/{incident_id}/comments")
async def add_incident_comment(incident_id: str, comment: str, user: User = Depends(get_current_user)):
    comment_data = IncidentComment(
        incident_id=incident_id,
        comment=comment,
        user_id=user.id,
        user_name=user.name
    )
    doc = comment_data.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.incident_comments.insert_one(doc)
    return {"message": "Comment added"}

@api_router.get("/incidents/{incident_id}/comments")
async def get_incident_comments(incident_id: str, user: User = Depends(get_current_user)):
    comments = await db.incident_comments.find({"incident_id": incident_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    for c in comments:
        if isinstance(c["created_at"], str):
            c["created_at"] = datetime.fromisoformat(c["created_at"])
    return comments

# ==================== DASHBOARD ENDPOINTS ====================

@api_router.get("/dashboard/kpis")
async def get_dashboard_kpis(user: User = Depends(get_current_user)):
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today.replace(day=1)
    
    # Sales today
    sales_today = await db.sales.count_documents({
        "created_at": {"$gte": today.isoformat()}
    })
    
    # Sales this month
    sales_month = await db.sales.count_documents({
        "created_at": {"$gte": month_start.isoformat()}
    })
    
    # Sales by company
    pipeline = [
        {"$group": {"_id": "$company", "count": {"$sum": 1}}}
    ]
    sales_by_company = await db.sales.aggregate(pipeline).to_list(100)
    
    # Sales by status
    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    sales_by_status = await db.sales.aggregate(status_pipeline).to_list(100)
    
    # Incidents
    incidents_open = await db.incidents.count_documents({"status": "Abierta"})
    incidents_progress = await db.incidents.count_documents({"status": "En Proceso"})
    incidents_closed = await db.incidents.count_documents({"status": "Cerrada"})
    
    # Objective progress
    current_month = datetime.now(timezone.utc).month
    current_year = datetime.now(timezone.utc).year
    objective = await db.objectives.find_one({"month": current_month, "year": current_year}, {"_id": 0})
    
    objective_data = None
    if objective:
        days_in_month = 30
        current_day = datetime.now(timezone.utc).day
        expected_daily = objective["team_target"] / days_in_month
        expected_now = expected_daily * current_day
        progress_pct = (sales_month / objective["team_target"]) * 100 if objective["team_target"] > 0 else 0
        
        # Traffic light
        if progress_pct >= expected_now / objective["team_target"] * 100:
            status_light = "green"
        elif progress_pct >= (expected_now / objective["team_target"] * 100) * 0.8:
            status_light = "yellow"
        else:
            status_light = "red"
        
        objective_data = {
            "target": objective["team_target"],
            "current": sales_month,
            "progress_pct": round(progress_pct, 1),
            "expected_daily": round(expected_daily, 1),
            "status": status_light
        }
    
    return {
        "sales_today": sales_today,
        "sales_month": sales_month,
        "sales_by_company": sales_by_company,
        "sales_by_status": sales_by_status,
        "incidents": {
            "open": incidents_open,
            "in_progress": incidents_progress,
            "closed": incidents_closed
        },
        "objective": objective_data
    }

@api_router.get("/dashboard/ranking")
async def get_team_ranking(user: User = Depends(get_current_user)):
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    users = await db.users.find({"role": "Empleado"}, {"_id": 0}).to_list(100)
    ranking = []
    
    for u in users:
        sales_month = await db.sales.count_documents({
            "created_by": u["id"],
            "created_at": {"$gte": month_start.isoformat()}
        })
        
        sales_today = await db.sales.count_documents({
            "created_by": u["id"],
            "created_at": {"$gte": today.isoformat()}
        })
        
        # Company breakdown
        pipeline = [
            {"$match": {"created_by": u["id"]}},
            {"$group": {"_id": "$company", "count": {"$sum": 1}}}
        ]
        company_breakdown = await db.sales.aggregate(pipeline).to_list(100)
        
        ranking.append({
            "user_id": u["id"],
            "name": u["name"],
            "sales_month": sales_month,
            "sales_today": sales_today,
            "company_breakdown": company_breakdown
        })
    
    ranking.sort(key=lambda x: x["sales_month"], reverse=True)
    return ranking

# ==================== OBJECTIVE ENDPOINTS ====================

@api_router.post("/objectives", response_model=Objective)
async def create_objective(obj_data: ObjectiveCreate, user: User = Depends(require_super_admin)):
    # Check if objective exists for this month
    existing = await db.objectives.find_one({"month": obj_data.month, "year": obj_data.year}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Objective already exists for this month")
    
    objective = Objective(**obj_data.model_dump())
    doc = objective.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.objectives.insert_one(doc)
    return objective

@api_router.get("/objectives")
async def get_objectives(user: User = Depends(require_super_admin)):
    objectives = await db.objectives.find({}, {"_id": 0}).sort("year", -1).sort("month", -1).to_list(100)
    for o in objectives:
        if isinstance(o["created_at"], str):
            o["created_at"] = datetime.fromisoformat(o["created_at"])
    return objectives

# ==================== FICHAJE ENDPOINTS ====================

@api_router.post("/fichajes", response_model=Fichaje)
async def create_fichaje(fichaje_data: FichajeCreate, user: User = Depends(get_current_user)):
    fichaje = Fichaje(user_id=user.id, type=fichaje_data.type)
    doc = fichaje.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.fichajes.insert_one(doc)
    return fichaje

@api_router.get("/fichajes")
async def get_fichajes(user: User = Depends(get_current_user)):
    query = {"user_id": user.id}
    if user.role == "SuperAdmin":
        query = {}
    
    fichajes = await db.fichajes.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for f in fichajes:
        if isinstance(f["timestamp"], str):
            f["timestamp"] = datetime.fromisoformat(f["timestamp"])
    return fichajes

# ==================== CONTACT ENDPOINTS ====================

@api_router.post("/contacts", response_model=Contact)
async def create_contact(contact_data: ContactCreate, user: User = Depends(get_current_user)):
    contact = Contact(**contact_data.model_dump(), created_by=user.id)
    doc = contact.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.contacts.insert_one(doc)
    return contact

@api_router.get("/contacts", response_model=List[Contact])
async def get_contacts(user: User = Depends(get_current_user)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("name", 1).to_list(1000)
    for c in contacts:
        if isinstance(c["created_at"], str):
            c["created_at"] = datetime.fromisoformat(c["created_at"])
    return contacts

@api_router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: str, user: User = Depends(require_super_admin)):
    result = await db.contacts.delete_one({"id": contact_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact deleted"}

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user: User = Depends(get_current_user)):
    query = {"$or": [{"user_id": user.id}, {"user_id": "all"}]}
    notifications = await db.notifications.find(query, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    for n in notifications:
        if isinstance(n["created_at"], str):
            n["created_at"] = datetime.fromisoformat(n["created_at"])
    return notifications

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: User = Depends(get_current_user)):
    result = await db.notifications.update_one({"id": notification_id}, {"$set": {"read": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

# ==================== CALCULATOR ENDPOINT ====================

@api_router.post("/calculator/recommend")
async def recommend_packs(pack_type: str, origin_company: Optional[str] = None, user: User = Depends(get_current_user)):
    query = {"active": True, "type": pack_type}
    packs = await db.packs.find(query, {"_id": 0}).to_list(100)
    
    # Filter by origin company observations
    recommendations = []
    for pack in packs:
        if isinstance(pack["created_at"], str):
            pack["created_at"] = datetime.fromisoformat(pack["created_at"])
        if pack.get("validity_start") and isinstance(pack["validity_start"], str):
            pack["validity_start"] = datetime.fromisoformat(pack["validity_start"])
        if pack.get("validity_end") and isinstance(pack["validity_end"], str):
            pack["validity_end"] = datetime.fromisoformat(pack["validity_end"])
        
        score = 0
        if origin_company and pack.get("observations") and origin_company.lower() in pack["observations"].lower():
            score = 10
        
        recommendations.append({**pack, "score": score})
    
    recommendations.sort(key=lambda x: (x["score"], -x["price"]), reverse=True)
    return recommendations[:3]

class ConfiguratorRequest(BaseModel):
    pack_type: Literal["Solo Móvil", "Solo Fibra", "Pack Fibra + Móvil", "Pack Fibra + Móvil + TV"]
    origin_company: Optional[str] = None
    priority: Literal["Ahorrar", "Equilibrado", "Máxima calidad"]
    mobile_gb: Optional[int] = None
    fiber_speed_mbps: Optional[int] = None
    minutes_type: Optional[str] = None
    additional_lines: int = 0
    tv_required: bool = False
    tv_package_type: Optional[str] = None
    respect_restrictions: bool = True

@api_router.post("/calculator/configure")
async def configure_packs(config: ConfiguratorRequest, user: User = Depends(get_current_user)):
    # Filter active packs by type
    query = {"active": True, "type": config.pack_type}
    packs = await db.packs.find(query, {"_id": 0}).to_list(1000)
    
    if not packs:
        return []
    
    recommendations = []
    
    for pack in packs:
        # Parse dates
        if isinstance(pack["created_at"], str):
            pack["created_at"] = datetime.fromisoformat(pack["created_at"])
        if pack.get("validity_start") and isinstance(pack["validity_start"], str):
            pack["validity_start"] = datetime.fromisoformat(pack["validity_start"])
        if pack.get("validity_end") and isinstance(pack["validity_end"], str):
            pack["validity_end"] = datetime.fromisoformat(pack["validity_end"])
        
        # Check restrictions
        if config.respect_restrictions and config.origin_company and pack.get("restrictions"):
            if config.origin_company.lower() not in pack["restrictions"].lower() and "solo" in pack["restrictions"].lower():
                continue
        
        # Check TV requirement
        if config.tv_required and not pack.get("tv_supported"):
            continue
        
        # Calculate score
        score = 0
        fit_details = []
        
        # Priority weights
        price_weight = 3 if config.priority == "Ahorrar" else (2 if config.priority == "Equilibrado" else 1)
        quality_weight = 1 if config.priority == "Ahorrar" else (2 if config.priority == "Equilibrado" else 3)
        
        # Mobile GB fit
        if config.mobile_gb and pack.get("mobile_gb"):
            gb_diff = abs(pack["mobile_gb"] - config.mobile_gb)
            if pack["mobile_gb"] >= config.mobile_gb:
                gb_score = max(0, 20 - (gb_diff / 10))
                score += gb_score * quality_weight
                fit_details.append(f"GB: {pack['mobile_gb']}GB (pedido: {config.mobile_gb}GB)")
            else:
                score -= 10  # Penalize if below needed
        
        # Fiber speed fit
        if config.fiber_speed_mbps and pack.get("fiber_speed_mbps"):
            speed_diff = abs(pack["fiber_speed_mbps"] - config.fiber_speed_mbps)
            if pack["fiber_speed_mbps"] >= config.fiber_speed_mbps:
                speed_score = max(0, 20 - (speed_diff / 100))
                score += speed_score * quality_weight
                fit_details.append(f"Fibra: {pack['fiber_speed_mbps']}Mbps")
            else:
                score -= 10
        
        # Price score (inverse - lower is better for "Ahorrar")
        max_price = 100
        price_score = ((max_price - pack["price"]) / max_price) * 20
        score += price_score * price_weight
        
        # TV bonus
        if config.tv_required and pack.get("tv_supported"):
            score += 15
            fit_details.append(f"TV: {pack.get('tv_package_type', 'incluida')}")
        
        # Additional lines
        if config.additional_lines > 0 and pack.get("additional_lines_supported"):
            score += 10
            fit_details.append(f"Líneas adicionales soportadas")
        
        # New pack bonus
        is_new = (datetime.now(timezone.utc) - pack["created_at"]).days < 30
        if is_new:
            score += 5
        
        # Origin company bonus
        if config.origin_company and pack.get("observations"):
            if config.origin_company.lower() in pack["observations"].lower():
                score += 10
                fit_details.append(f"Especial para {config.origin_company}")
        
        recommendations.append({
            **pack,
            "score": round(score, 2),
            "fit_details": fit_details,
            "is_new": is_new,
            "badges": []
        })
    
    # Sort by score
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    
    # Assign badges to top 3
    if len(recommendations) > 0:
        recommendations[0]["badges"].append("Mejor valor")
    
    # Find cheapest
    if len(recommendations) > 1:
        cheapest_idx = min(range(len(recommendations[:3])), key=lambda i: recommendations[i]["price"])
        if "Más barato" not in recommendations[cheapest_idx]["badges"]:
            recommendations[cheapest_idx]["badges"].append("Más barato")
    
    # Find most complete (highest quality features)
    if len(recommendations) > 2:
        most_complete_idx = 0
        max_features = 0
        for i, pack in enumerate(recommendations[:3]):
            feature_count = sum([
                1 if pack.get("mobile_gb", 0) > 20 else 0,
                1 if pack.get("fiber_speed_mbps", 0) > 500 else 0,
                1 if pack.get("tv_supported") else 0,
                1 if pack.get("additional_lines_supported") else 0
            ])
            if feature_count > max_features:
                max_features = feature_count
                most_complete_idx = i
        if most_complete_idx > 0:
            recommendations[most_complete_idx]["badges"].append("Más completo")
    
    # Add "Nueva" badge
    for rec in recommendations[:3]:
        if rec.get("is_new"):
            rec["badges"].append("Nueva")
    
    return recommendations[:3]

# ==================== EXPORT ENDPOINTS ====================

@api_router.get("/export/sales/csv")
async def export_sales_csv(user: User = Depends(require_super_admin)):
    sales = await db.sales.find({}, {"_id": 0}).to_list(10000)
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "client_id", "company", "pack_type", "status", "created_at"])
    writer.writeheader()
    for sale in sales:
        writer.writerow({
            "id": sale["id"],
            "client_id": sale["client_id"],
            "company": sale["company"],
            "pack_type": sale["pack_type"],
            "status": sale["status"],
            "created_at": sale["created_at"]
        })
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales.csv"}
    )

@api_router.get("/export/sales/pdf")
async def export_sales_pdf(user: User = Depends(require_super_admin)):
    sales = await db.sales.find({}, {"_id": 0}).limit(100).to_list(100)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    elements.append(Paragraph("Reporte de Ventas - HIPNOTIK LEVEL Stand", styles['Title']))
    elements.append(Spacer(1, 12))
    
    data = [["ID", "Compañía", "Tipo", "Estado", "Fecha"]]
    for sale in sales[:20]:
        data.append([
            sale["id"][:8],
            sale["company"],
            sale["pack_type"],
            sale["status"],
            str(sale["created_at"])[:10]
        ])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=sales.pdf"}
    )

# ==================== DEMO DATA ENDPOINTS ====================

@api_router.post("/demo/seed")
async def seed_demo_data(user: User = Depends(require_super_admin)):
    # Create demo users
    demo_users = [
        {"id": "demo-tai", "email": "tai@demo.com", "password": hash_password("demo123"), "name": "Tai", "role": "Empleado", "language": "es", "created_at": datetime.now(timezone.utc).isoformat(), "is_demo": True},
        {"id": "demo-carlos", "email": "carlos@demo.com", "password": hash_password("demo123"), "name": "Carlos", "role": "Empleado", "language": "es", "created_at": datetime.now(timezone.utc).isoformat(), "is_demo": True},
        {"id": "demo-miguel", "email": "miguel@demo.com", "password": hash_password("demo123"), "name": "Miguel Ángel", "role": "Empleado", "language": "es", "created_at": datetime.now(timezone.utc).isoformat(), "is_demo": True}
    ]
    
    await db.users.insert_many(demo_users)
    
    # Create demo clients
    demo_clients = []
    for i in range(1, 21):
        demo_clients.append({
            "id": f"demo-client-{i}",
            "name": f"Cliente Demo {i}",
            "phone": f"600{str(i).zfill(6)}",
            "email": f"cliente{i}@demo.com",
            "city": "Madrid" if i % 2 == 0 else "Barcelona",
            "created_by": "demo-tai",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True
        })
    
    await db.clients.insert_many(demo_clients)
    
    # Create demo packs
    companies = ["Jazztel", "MásMóvil", "Pepephone", "Simyo"]
    demo_packs = []
    for i, company in enumerate(companies):
        for j, pack_type in enumerate(["Solo Móvil", "Solo Fibra", "Pack Fibra + Móvil"]):
            demo_packs.append({
                "id": f"demo-pack-{i}-{j}",
                "company": company,
                "name": f"{pack_type} - {company}",
                "type": pack_type,
                "price": 25.0 + (i * 5) + (j * 10),
                "features": f"Características del pack {pack_type}",
                "active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "is_demo": True
            })
    
    await db.packs.insert_many(demo_packs)
    
    # Create demo sales
    demo_sales = []
    for i in range(1, 16):
        demo_sales.append({
            "id": f"demo-sale-{i}",
            "client_id": f"demo-client-{i}",
            "company": companies[i % len(companies)],
            "pack_type": ["Solo Móvil", "Solo Fibra", "Pack Fibra + Móvil"][i % 3],
            "status": ["Registrado", "Subido a compañía", "Instalado"][i % 3],
            "created_by": demo_users[i % len(demo_users)]["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True
        })
    
    await db.sales.insert_many(demo_sales)
    
    # Create demo incidents
    demo_incidents = []
    for i in range(1, 9):
        demo_incidents.append({
            "id": f"demo-incident-{i}",
            "client_id": f"demo-client-{i}",
            "title": f"Incidencia Demo {i}",
            "description": f"Descripción de la incidencia {i}",
            "priority": ["Baja", "Media", "Alta"][i % 3],
            "type": "Técnica",
            "status": ["Abierta", "En Proceso", "Cerrada"][i % 3],
            "created_by": user.id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_demo": True
        })
    
    await db.incidents.insert_many(demo_incidents)
    
    # Create demo objective
    await db.objectives.insert_one({
        "id": "demo-objective",
        "month": datetime.now(timezone.utc).month,
        "year": datetime.now(timezone.utc).year,
        "team_target": 50,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Demo data created successfully"}

@api_router.delete("/demo/clean")
async def clean_demo_data(user: User = Depends(require_super_admin)):
    await db.users.delete_many({"is_demo": True})
    await db.clients.delete_many({"is_demo": True})
    await db.sales.delete_many({"is_demo": True})
    await db.packs.delete_many({"is_demo": True})
    await db.incidents.delete_many({"is_demo": True})
    await db.objectives.delete_many({"id": "demo-objective"})
    
    return {"message": "Demo data deleted successfully"}

# ==================== INCLUDE ROUTER ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
