from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import config  # to load environment vars
import admin  # to load admin models
from fastadmin.api.frameworks.fastapi.app import app as admin_app
from auth_api import router as auth_router
from main_api import router as main_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/admin", admin_app)
app.include_router(auth_router)
app.include_router(main_router)
