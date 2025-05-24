from sqlalchemy import Column, Integer, String

from sqliteutils.db import Base


class FileText(Base):
    __tablename__ = "file_text"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(100))
    file_name = Column(String)
    file_content = Column(String)
    file_json = Column(String)
    file_token = Column(String)
    file_lemma = Column(String)

class BundleList(Base):
    __tablename__ = "bundle_list"
    id = Column(Integer, primary_key=True, index=True)
    bundle_name = Column(String)

class DMList(Base):
    __tablename__ = "dm_list"
    id = Column(Integer, primary_key=True, index=True)
    marker_name = Column(String)
    category = Column(String)
    sub_category = Column(String)