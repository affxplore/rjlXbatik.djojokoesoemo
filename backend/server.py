import os
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, APIRouter
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime, select, func
from pydantic import BaseModel
from datetime import datetime
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
# from flask import Flask, render_template, request, jsonify
# from flask_mysqldb import MySQL

load_dotenv()

# --- DATABASE SETUP ---
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# --- MODEL DATABASE (Tabel MySQL) ---
class Registration(Base):
    __tablename__ = "registrations"
    id = Column(Integer, primary_key=True, index=True)
    fullName = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    classType = Column(String(100))
    preferredDate = Column(String(100))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- SCHEMA VALIDASI (Pydantic) ---
class RegistrationCreate(BaseModel):
    fullName: str
    email: str
    phone: str
    classType: str
    preferredDate: str
    message: str = ""

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- AUTO CREATE TABLE ---
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# SEEDER: Tambah data contoh jika tabel masih kosong
    async with AsyncSessionLocal() as session:
        # Cek apakah sudah ada data
        result = await session.execute(select(Registration))
        exists = result.scalars().first()
        
        if not exists:
            sample_data = Registration(
                fullName="Budi Penenun",
                email="budi@example.com",
                phone="08123456789",
                classType="Batik Class",
                preferredDate="2024-05-20",
                message="Halo, saya ingin belajar batik tulis."
            )
            session.add(sample_data)
            await session.commit()
            print("✅ Seeder: Data awal berhasil ditambahkan!")

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr

# --- Konfigurasi Email ---
conf = ConnectionConfig(
    MAIL_USERNAME = "afifa.studyzone@gmail.com",
    MAIL_PASSWORD = "mcgflqsgbgivoxia", # "Gmail App Password"
    MAIL_FROM = "afifa.studyzone@gmail.com",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

# --- Fungsi Kirim Email ---
async def send_email_to_admin(data):
    html = f"""
    <h3>Pendaftaran Baru: RJL Group</h3>
    <p><b>Nama:</b> {data.fullName}</p>
    <p><b>Email:</b> {data.email}</p>
    <p><b>Telepon:</b> {data.phone}</p>
    <p><b>Kelas:</b> {data.classType}</p>
    <p><b>Tanggal:</b> {data.preferredDate}</p>
    <p><b>Pesan:</b> {data.message}</p>
    """
    
    message = MessageSchema(
        subject="New Registration Alert - RJL Group",
        recipients=["afifa.studyzone@gmail.com"], # Email tujuan (Admin)
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

# --- Update Route POST ---
@api_router.post("/registrations")
async def create_registration(data: RegistrationCreate):
    async with AsyncSessionLocal() as session:
        # 1. Simpan ke Database
        new_entry = Registration(
            fullName=data.fullName,
            email=data.email,
            phone=data.phone,
            classType=data.classType,
            preferredDate=data.preferredDate,
            message=data.message
        )
        session.add(new_entry)
        await session.commit()

        # 2. Kirim Email (Panggil fungsi kirim email)
        try:
            await send_email_to_admin(data)
        except Exception as e:
            print(f"Gagal kirim email: {e}")

        return {"status": "success", "message": "Data tersimpan & email terkirim!"}


# --- Jumlah total kapasitas workshop ---
TOTAL_SPOTS = 16

# --- GET: Ambil daftar peserta terdaftar ---
@api_router.get("/registrations")
async def get_registrations(limit: int = 5, skip: int = 0):
    async with AsyncSessionLocal() as session:
        # Hitung total peserta
        count_result = await session.execute(select(func.count()).select_from(Registration))
        total = count_result.scalar()

        # Ambil data dengan offset dan limit
        result = await session.execute(
            select(Registration).order_by(Registration.created_at.desc()).offset(skip).limit(limit)
        )
        rows = result.scalars().all()

        participants = []
        for i, r in enumerate(rows):
            participants.append({
                "no": skip + i + 1,
                "fullName": r.fullName,
                "email": r.email,
                "classType": r.classType,
                "preferredDate": r.preferredDate,
                "registeredAt": r.created_at.strftime("%d %b %Y, %H:%M") if r.created_at else "-"
            })

        return {
            "status": "success",
            "totalSpots": TOTAL_SPOTS,
            "filledSpots": total,
            "totalParticipants": total,
            "participants": participants
        }


# --- CORS SETUP (Agar Frontend bisa akses Backend) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


