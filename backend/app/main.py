from fastapi import FastAPI

from app.api import transactions
from app.core.db import Base, engine
from fastapi.routing import APIRoute


def custom_generate_unique_id(route: APIRoute):
    if not route.tags:
        # Return just the name if no tags are specified
        return route.name
    return f"{route.tags[0]}-{route.name}"


app = FastAPI(title="Personal Finance App", generate_unique_id_function=custom_generate_unique_id)

Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "API is running"}


app.include_router(transactions.router)
