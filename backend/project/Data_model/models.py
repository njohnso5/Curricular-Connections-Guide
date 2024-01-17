from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import enum
from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    CheckConstraint,
    Boolean,
    Enum,
    DateTime,
    Table,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from dataclasses import dataclass

# Required
db = SQLAlchemy()
ma = Marshmallow()


class PeriodEnum(enum.Enum):
    FALL = "fall"
    SPRING = "spring"
    SUMMER = "summer"


class Period(db.Model):
    __table_name__ = "period"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    period: Mapped[PeriodEnum] = mapped_column(Enum(PeriodEnum), nullable=False)
    semesters = relationship("Semester", back_populates="period", lazy=True)


Program_to_Theme = Table(
    "program_to_theme",
    db.Model.metadata,
    Column("program_id", ForeignKey("program.id")),
    Column("theme_id", ForeignKey("theme.id")),
)

Course_to_Theme = Table(
    "course_to_theme",
    db.Model.metadata,
    Column("course_id", ForeignKey("course.id")),
    Column("theme_id", ForeignKey("theme.id")),
)

Course_to_Faculty = Table(
    "course_to_faculty",
    db.Model.metadata,
    Column("course_id", ForeignKey("course.id")),
    Column("faculty_id", ForeignKey("faculty.id")),
)


@dataclass
class Theme(db.Model):
    id: Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)
    name: Mapped[String] = mapped_column(String(50), nullable=False, unique=True)



class Course(db.Model):
    __table_name__ = "course"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title_short: Mapped[String] = mapped_column(
        String(250), nullable=False, unique=False
    )
    title_long: Mapped[String] = mapped_column(String(500), nullable=False)
    description: Mapped[String] = mapped_column(String(5000), nullable=False)
    subject : Mapped["Subject"] = relationship()
    subject_id: Mapped[ForeignKey] = mapped_column(
        ForeignKey("subject.id"), nullable=False
    )
    catalog_number: Mapped[String] = mapped_column(String(7), nullable=False)
    semester_id: Mapped[ForeignKey] = mapped_column(
        ForeignKey("semester.id"), nullable=False
    )
    semester = relationship("Semester", back_populates="courses", lazy=True, cascade="all, delete")
    themes: Mapped[list["Theme"]] = relationship(secondary=Course_to_Theme)
    faculty: Mapped[list["Faculty"]] = relationship(secondary=Course_to_Faculty)


class Semester(db.Model):
    __table_name__ = "semester"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False)
    period_id: Mapped[ForeignKey] = mapped_column(ForeignKey("period.id"))
    courses = relationship("Course", back_populates="semester", lazy=True, cascade="all, delete")
    period = relationship("Period", back_populates="semesters", lazy=True)

class Subject(db.Model):
    __table_name__ = "subject"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject: Mapped[String] = mapped_column(String(6), nullable=False) 

class Department(enum.Enum):
    CRAFTS = "Crafts Center"
    DPAT = "Department of Performing Arts & Technology"
    GMAD = "Gregg Museum of Art & Design"
    LIVE = "NC State LIVE performing artist series"
    UT = "University Theatre"


@dataclass
class Program(db.Model):
    __table_name__ = "Program"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    department: Mapped[String] = mapped_column(
        Enum(
            "Crafts Center",
            "Department of Performing Arts & Technology",
            "Gregg Museum of Art & Design",
            "NC State LIVE performing artist series",
            "University Theatre",
        )
    )
    link: Mapped[String] = mapped_column(String(150), nullable=True)
    title: Mapped[String] = mapped_column(String(50), nullable=False)
    description: Mapped[String] = mapped_column(String(2000), nullable=False)
    image_filename: Mapped[String] = mapped_column(String(150), nullable=True)
    showings: Mapped[list["Showing"]] = relationship()
    themes: Mapped[list["Theme"]] = relationship(secondary=Program_to_Theme)


@dataclass
class Showing(db.Model):
    __table_name__ = "Showing"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    datetime: Mapped[DateTime] = mapped_column(DateTime, nullable=False)
    location: Mapped[String] = mapped_column(String(100), nullable=False)
    price: Mapped[String] = mapped_column(String(100), nullable=False)
    program_id: Mapped[ForeignKey] = mapped_column(
        ForeignKey("program.id"), nullable=False
    )

class RoleEnum(enum.Enum):
    SUPERUSER = "superuser"
    ADMIN = "admin"
    CCG = "ccg"
    VIEWER = "viewer"
    UNAUTHORIZED = "unauthorized"
    
    def __str__(self):
        return self.value

class Role(db.Model):
    __table_name__ = "role"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum), nullable=False)
    administrators = relationship("Administrator", back_populates="role", lazy=True)

class Administrator(db.Model):
    __table_name__ = "administrator" 
    id : Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)
    unity_id : Mapped[String] = mapped_column(String(15), nullable=False)
    role_id: Mapped[ForeignKey] = mapped_column(ForeignKey("role.id"), nullable=False, default=2)
    role = relationship('Role', back_populates='administrators', lazy=True)


@dataclass
class User(db.Model):
    id: Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)
    role: Mapped[enum.Enum] = mapped_column(Enum("admin", "operator", "unauthorized"))
    unityid: Mapped[String] = mapped_column(String(15), nullable=False)
    
class Faculty(db.Model):
    _table_name__ = "faculty"
    id: Mapped[int] = mapped_column(Integer, nullable=False, primary_key=True)
    email: Mapped[String] = mapped_column(String(100), nullable=False)
    
