from app.core.db import get_db
from app.models.transaction import Transaction as TransactionModel
from app.schemas.transaction import Transaction, TransactionCreate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[Transaction])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(TransactionModel).all()


@router.post("/", response_model=Transaction)
def add_transaction(tx: TransactionCreate, db: Session = Depends(get_db)):
    db_tx = TransactionModel(**tx.model_dump())
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx


@router.put("/{tx_id}", response_model=Transaction)
def update_transaction(
    tx_id: int,
    tx: TransactionCreate,
    db: Session = Depends(get_db),
):
    db_tx = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if not db_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for key, value in tx.model_dump().items():
        setattr(db_tx, key, value)
    db.commit()
    db.refresh(db_tx)
    return db_tx


@router.delete("/{tx_id}")
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    db_tx = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if not db_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(db_tx)
    db.commit()
    return {"status": "deleted"}
