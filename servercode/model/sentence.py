from pydantic import BaseModel, Field
from typing import Union, Optional


class SentenceBase(BaseModel):
    id: Union[int, None]
    pro_id: int


class Sentence(SentenceBase):
    id: int
    pro_id: int
    pro_name: str
    key: int
    value1: str
    value2: str
    created_at: str
    updated_at: str

    class Config:
        orm_mode = True


class SentenceSave(SentenceBase):
    pro_id: Union[int, None]
    key: int
    value1: str
    value2: str
    created_at: Union[str, None]


class SentenceUpdate(SentenceBase):
    pro_id: int
    key: int
    value1: str
    value2: str
    updated_at: Union[str, None]


class SentenceParams(BaseModel):
    current: Optional[int] = 1
    pageSize: Optional[int] = 10
    pro_name: Optional[str] = None
    value1: Optional[str] = None
    value2: Optional[str] = None

