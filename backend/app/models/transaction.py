from sqlalchemy import Column, Integer, String, Float
from app.core.db import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # income or expense
    category = Column(String, nullable=True)
    description = Column(String, nullable=True)
    