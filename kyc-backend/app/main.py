from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .database import engine
from .models import Base
from .routers import user, upload, kyc, selfie, liveness, admin
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Mount uploads directory to serve static files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(upload.router)
app.include_router(kyc.router)
app.include_router(selfie.router)
app.include_router(liveness.router)
app.include_router(admin.router)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"msg": "KYC API Running on Port 9090 "}
