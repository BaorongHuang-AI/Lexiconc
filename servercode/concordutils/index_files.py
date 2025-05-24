import json
import os
import uuid

import spacy

from sqliteutils import crud, models
from sqliteutils.db import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

nlp_en = spacy.load(name='en_core_web_sm')

def index_line(line):
    doc_en = nlp_en(line)
    line_results = []
    token_results = []
    lemma_results = []
    for sent in doc_en.sents:
        indi_line = []
        for token in sent:
            indi_line.append({ 'word': token.text,
        'lemma': token.lemma_,
        'pos': token.pos_ })
            token_results.append(token.text)
            lemma_results.append(token.lemma_)
        line_results.append(indi_line)
    return line_results, token_results, lemma_results


def index_file(file_path, file, db):
    with open(file_path, encoding="utf8", errors='ignore') as f:
        # content = f.read()
        lines = f.readlines()
        content = "\n".join(lines)
        results = []
        results_token = []
        results_lemma = []

        for line in lines:
            if len(line.strip()) > 0:
                line_results, token_results, lemma_results = index_line(line.strip())
                results.extend(line_results)
                results_token.extend(token_results)
                results_lemma.extend(lemma_results)
        file_json = str(json.dumps({"text": results}))
        # print(file, file_json)
        all_token = " ".join(results_token)
        all_lemma = " ".join(results_lemma)
        uuid_name = str(uuid.uuid1())
        new_data = models.FileText(uuid=uuid_name, file_name=file, file_content=content, file_token=all_token, file_lemma = all_lemma,
                                   file_json=file_json)
        crud.save_file(db, new_data)
        return {"id": new_data.id, "uuid": uuid_name, "file_name":file}


def index_folder(folder_name, db):
    db =  get_db()
    files = os.listdir(folder_name)
    folder_results = []
    for file in files:
        file_path = os.path.join(folder_name, file)
        folder_results.append(index_file(file_path, file, db))
    return folder_results


if __name__ == "__main__":
    db_gen = get_db()
    db = next(db_gen)
    file_name = "../renamedFiles/1.txt"
    print(index_file(file_name, "1.txt", db))