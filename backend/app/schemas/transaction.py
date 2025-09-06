from pydantic import BaseModel, ConfigDict


class TransactionBase(BaseModel):
    date: str
    amount: float
    type: str
    category: str | None = None
    description: str | None = None


class TransactionCreate(TransactionBase):
    pass


class Transaction(TransactionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
