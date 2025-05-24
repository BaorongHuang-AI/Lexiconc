from pydantic import BaseModel
from typing import Union, List
from enum import Enum
from model.sentence import SentenceSave


class ProjectStatusEnum(Enum):
    UNPROCESSED: "未开始"
    PROCESSING: "处理中"
    FINISH: "已完成"


class ProjectBase(BaseModel):
    id: Union[int, None]
    name: str


class Project(ProjectBase):
    id: int
    name: str
    src_lang: str
    tgt_lang: str
    src_file: str
    tgt_file: str
    status: str
    created_at: str
    updated_at = str

    class Config:
        orm_mode = True


class ProjectSave(ProjectBase):
    name: str
    src_lang: Union[str, None]
    tgt_lang: Union[str, None]
    src_file: Union[str, None]
    tgt_file: Union[str, None]
    status: Union[str, None]
    created_at: Union[str, None]


class ProjectUpdate(ProjectBase):
    id: int
    name: Union[str, None]
    src_lang: Union[str, None]
    tgt_lang: Union[str, None]
    src_file: Union[str, None]
    tgt_file: Union[str, None]
    status: Union[str, None]
    updated_at: Union[str, None]


class ProjectWithSentences(BaseModel):
    project: ProjectUpdate
    sentences: List[SentenceSave]

