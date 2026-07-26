from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import (
    auth, patients, appointments, vitals,
    consultations, prescriptions, medicines,
    investigations, billing, settings as settings_router, search, dashboard,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(vitals.router)
app.include_router(consultations.router)
app.include_router(prescriptions.router)
app.include_router(medicines.router)
app.include_router(investigations.router)
app.include_router(investigations.templates_router)
app.include_router(billing.router)
app.include_router(settings_router.router)
app.include_router(search.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.app_name}
