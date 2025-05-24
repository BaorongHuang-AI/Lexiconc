from sqlalchemy.orm import Session

import sqliteutils.models as models
import time
from sqlalchemy import and_, or_, text, select
from typing import Optional


def save_file(db: Session, file_text: models.FileText):
    new_data = models.FileText(uuid=file_text.uuid, file_name=file_text.file_name, file_content=file_text.file_content,
                               file_token= file_text.file_token,
                               file_lemma=file_text.file_lemma,
                               file_json=file_text.file_json)
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data


def get_file(db: Session, uuid: str):
    db_data = db.query(models.FileText).filter(models.FileText.uuid == uuid).first()
    return db_data

def get_file_content(db: Session, uuid: str):
    db_data = db.query(models.FileText).filter(models.FileText.uuid == uuid).first()
    return db_data['file_content']

def list_all_files(db: Session):
    query = select(
        models.FileText.uuid,
        models.FileText.file_name
    )
    all_files =  db.execute(query).fetchall()
    all_dict = []
    for record in all_files:
        all_dict.append(record._asdict())
    return all_dict


def list_all_files_in_ids(db: Session, ids: [str]):
    all_files = db.query(models.FileText).all()
    filtered_files = [file for file in all_files if file.uuid in ids]
    return filtered_files

def delete_project(db: Session, uuid: str):
    db_project = get_file(db=db, uuid=uuid)
    db.delete(db_project)
    db.commit()


def delete_bundle_list(db: Session):
    db.execute(text("delete from bundle_list"))
    db.commit()

def save_bundle(db: Session, bundle_name:str):
    new_data = models.BundleList(bundle_name=bundle_name)
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

def list_all_bundles(db: Session):
    all_bundles = db.query(models.BundleList).all()
    return all_bundles



def delete_dm_list(db: Session):
    db.execute(text("delete from dm_list"))
    db.commit()

def save_dm(db: Session, marker_name:str, category:str, sub_category:str):
    new_data = models.DMList(marker_name=marker_name, category=category, sub_category=sub_category)
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

def list_all_markers(db: Session):
    all_markers = db.query(models.DMList).all()
    return all_markers


def deleteFile(file, db):
    db.execute(text(f"delete from file_text where uuid='{file.uuid}'"))
    db.commit()