import base64
import json
import os.path
from collections import Counter
from io import BytesIO
from typing import Union, List, Optional

import cqls
import uvicorn
from concordancer.concordancer import Concordancer
from fastapi import FastAPI, UploadFile, File, Form, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from concordutils.dmStatsUtils import cal_dm_stats
from concordutils.excelUtils import save_lexiExcel, save_dmExcel
from concordutils.index_files import index_file
from concordutils.lbStatsUtils import cal_lb_stats
from sqliteutils import crud
from sqliteutils.crud import list_all_markers, list_all_bundles
from sqliteutils.db import SessionLocal
from sqliteutils.models import FileText
from utils import filenameutils
from lexical_diversity import lex_div as ld
import matplotlib
import matplotlib.pyplot as plt

matplotlib.use('Agg')

global concordObject
app = FastAPI()
origins = [
    "http://localhost"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
import logging

logging.basicConfig(filename='logs/lexiconc.log', level=logging.DEBUG)


class Item(BaseModel):
    folderPath: str
    language: str


class CorpusQuery(BaseModel):
    query: str
    leftCount: int
    rightCount: int
    fileIds: List


class CorpusStatsQuery(BaseModel):
    fileIds: List


class WordQuery(BaseModel):
    term: Optional[str]
    minFreq: int
    fileIds: List


class IndexPost(BaseModel):
    filePath: str
    isFolder: bool


class FileDeletionModel(BaseModel):
    file_name: str
    uuid: str


class WordCloudQuery(BaseModel):
    wordCount: int
    fileIds: List


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/api/file/uploadAndIndex")
async def uploadAndIndex(indexPost: IndexPost, db: Session = Depends(get_db)):
    print(indexPost)
    if indexPost.isFolder:
        files = os.listdir(indexPost.filePath)
        print("file", files)
        for file_name in files:
            if file_name.endswith(".txt"):
                file_path = os.path.join(indexPost.filePath, file_name)
                print({'origin': file_path})
                file_name = os.path.basename(file_path)
                index_file(file_path, file_name, db)
        return {"code": 200, "data": "success"}

    else:
        # addr = upload_tmp_full + file_name
        logging.debug({'origin': indexPost.filePath})
        file_name = os.path.basename(indexPost.filePath)
        index_results = index_file(indexPost.filePath, file_name, db)
        return {"code": 200, "data": "success"}


@app.get("/api/file/allFiles")
async def getAllFiles(db: Session = Depends(get_db)):
    allFiles = crud.list_all_files(db)
    return {"code": 200, "data": allFiles}

@app.post("/api/file/getFileContent")
async def getFileContent(file: FileDeletionModel, db: Session = Depends(get_db)):
    file_content = crud.get_file_content(db, file.uuid)
    return {"code": 200, "data": file_content}


@app.post("/api/file/deleteFile")
async def deleteFile(file: FileDeletionModel, db: Session = Depends(get_db)):
    crud.deleteFile(file, db)
    return {"code": 200, "data": "success"}


@app.post("/api/file/uploadAndParser")
async def uploadAndParser(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    if len(content) > 0:
        output_file = "./temp/" + file.filename
        file_name = filenameutils.standardization_filename(file.filename)
        # addr = upload_tmp_full + file_name
        with open(output_file, 'wb') as f:
            f.write(content)
            logging.debug({'origin': file.filename, 'type': file.content_type, 'save_name': file_name})
            index_results = index_file(output_file, file.filename, db)
            return {"code": 200, "data": index_results}
        # segs = seg_file_to_segments(output_file, language)


    else:
        logging.warning({'status': 'isn`t file'})
        return {"code": 500}


@app.post("/api/file/calCorpusStats")
def search_WordFreq(query: CorpusStatsQuery, db: Session = Depends(get_db)):
    ############ DEBUGGING ##############
    print("calculating corpus stats...")
    ############ _DEBUGGING ##############
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    print(len(allFiles))
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append(json.loads(f.file_json))

    # corpus = [json.loads(f.file_json) for f in allFiles]
    if len(corpus) == 0:
        return {"code": 200, "data": {
            'results': [],
            'default_attr': ""
        }}

    # concordObject = Concordancer(corpus)
    # Restore escaped characters in URL back to original forms
    # cql = query.query
    try:
        word_list = []
        sent_count = 0
        for entry in corpus:
            for line in entry['text']:
                sent_count = sent_count + 1
                for word in line:
                    word_list.append(word['word'])
        ttr = ld.ttr(word_list)
        totalTokens = len(word_list)
        totalTypes = len(set(word_list))
        sttr = ld.mattr(word_list, window_length=1000)
        return {"code": 200, "data": {
            "tokens": totalTokens,
            "types": totalTypes,
            "sents": sent_count,
            "ttr": ttr,
            "sttr": sttr,
            "files": len(allFiles)
        }}
    except Exception as e:
        print(e)
        return {"code": 400, "data": "Query syntax error"}


from wordcloud import WordCloud, STOPWORDS


def get_word_cloud_data(wordCount, corpus):
    tokens = []
    for file_json in corpus:
        for line in file_json['text']:
            text_tokens = []
            for word_info in line:
                text_tokens.append(word_info['word'])
            tokens.extend(text_tokens)
    # target_words = ['Game', 'player', 'score', 'oil', 'Man']

    # Create the visualizer and draw the plot
    wordcloud = WordCloud(max_font_size=50, max_words=wordCount, background_color="white",
                          stopwords=STOPWORDS).generate(" ".join(tokens))

    # visualizer.fit(tokens)
    # # outpath = "temp/" + str(uuid.uuid4()) + ".png"
    # # print(outpath)
    buf = BytesIO()
    # fig.savefig(buf, format="png")
    # Embed the result in the html output.
    # data = base64.b64encode(buf.getbuffer()).decode("ascii")
    # return f"<img src='data:image/png;base64,{data}'/>"
    # visualizer.show(outpath=buf)
    plt.figure(dpi=500)
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.axis("off")
    plt.savefig(buf, format='png')
    data = base64.b64encode(buf.getbuffer()).decode("ascii")
    return data


@app.post("/api/corpus/getWordCloud")
def get_word_cloud(query: WordCloudQuery, db: Session = Depends(get_db)):
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    print(len(allFiles))
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append(json.loads(f.file_json))

    # corpus = [json.loads(f.file_json) for f in allFiles]
    if len(corpus) == 0:
        return {"code": 200, "data": {
            'results': [],
            'default_attr': ""
        }}

    # concordObject = Concordancer(corpus)

    # Restore escaped characters in URL back to original forms
    # cql = query.query
    try:
        word_cloud_data = get_word_cloud_data(query.wordCount, corpus)
    except Exception as e:
        print(e)
        return {"code": 400, "data": "Query syntax error"}
    # image_data = open(dispersion_plot_path, mode='r').read()
    return {"code": 200, "data": word_cloud_data}


@app.post("/api/file/searchWordFreq")
def search_WordFreq(query: WordQuery, db: Session = Depends(get_db)):
    ############ DEBUGGING ##############
    print("cal corpus stats...")
    ############ _DEBUGGING ##############
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    print(len(allFiles))
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append(json.loads(f.file_json))

    # corpus = [json.loads(f.file_json) for f in allFiles]
    if len(corpus) == 0:
        return {"code": 200, "data": {
            'results': [],
            'default_attr': ""
        }}

    # concordObject = Concordancer(corpus)
    # Restore escaped characters in URL back to original forms
    # cql = query.query
    try:
        word_list = []
        for entry in corpus:
            for line in entry['text']:
                for word in line:
                    word_list.append(word['word'])
        results = dict(Counter(word_list).most_common(500))
        outputResults = []
        if len(query.term) > 0:
            outputResults.append({"Word": query.term, "Frequency": results[query.term]})
            return {"code": 200, "data": outputResults}
        res = [(ele, cnt) for ele, cnt in results.items() if cnt >= query.minFreq]
        for item in res:
            if len(item[0].strip()) > 0:
                outputResults.append({"Word": item[0], "Frequency": item[1]})
        return {"code": 200, "data": outputResults}

    except Exception as e:
        print(e)
        return {"code": 400, "data": "Query syntax error"}


@app.post("/api/file/uploadAndParseBundleExcel")
async def root(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    if len(content) > 0:
        output_file = "./temp/" + file.filename
        file_name = filenameutils.standardization_filename(file.filename)
        # addr = upload_tmp_full + file_name
        with open(output_file, 'wb') as f:
            f.write(content)
            logging.debug({'origin': file.filename, 'type': file.content_type, 'save_name': file_name})
            results = save_lexiExcel(output_file, db)
            return {"code": 200, "data": results}
        # segs = seg_file_to_segments(output_file, language)
    else:
        logging.warning({'status': 'isn`t file'})
        return {"code": 500}


@app.post("/api/file/uploadAndParseDmExcel")
async def root(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    if len(content) > 0:
        output_file = "./temp/" + file.filename
        file_name = filenameutils.standardization_filename(file.filename)
        # addr = upload_tmp_full + file_name
        with open(output_file, 'wb') as f:
            f.write(content)
            logging.debug({'origin': file.filename, 'type': file.content_type, 'save_name': file_name})
            results = save_dmExcel(output_file, db)
            return {"code": 200, "data": results}
        # segs = seg_file_to_segments(output_file, language)
    else:
        logging.warning({'status': 'isn`t file'})
        return {"code": 500}



@app.get("/api/file/getAllDms")
async def root(db: Session = Depends(get_db)):
    results = list_all_markers(db)
    return {"code": 200, "data": results}

@app.get("/api/file/getAllLbs")
async def root(db: Session = Depends(get_db)):
    results = list_all_bundles(db)
    return {"code": 200, "data": results}

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/createIndex")
def index_corpus(item: Item):
    # concordObject
    return {"language": item.language, "folderPath": item.folderPatho}


@app.post("/search")
def search_corpus(query: CorpusQuery, db: Session = Depends(get_db)):
    ############ DEBUGGING ##############
    print("Searching corpus...")
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append(json.loads(f.file_json))

    # corpus = [json.loads(f.file_json) for f in allFiles]
    if len(corpus) == 0:
        return {"code": 200, "data": {
            'results': [],
            'default_attr': ""
        }}

    concordObject = Concordancer(corpus)

    # Restore escaped characters in URL back to original forms
    cql = query.query
    try:
        cqls.parse(cql)
    except:
        return {"code": 400, "data": "Query syntax error"}

    # Query Database
    concord_list = list(
        concordObject.cql_search(
            cql,
            left=query.leftCount,
            right=query.rightCount
        )
    )

    for item in concord_list:
        file_name = allFiles[item["position"]["doc_idx"]].file_name
        item['fileName'] = file_name

    # Response to frontend
    ############ DEBUGGING ##############
    print(f"Found {len(concord_list)} results...\n")
    ############ _DEBUGGING ##############
    return {"code": 200, "data": {
        'results': concord_list,
        'default_attr': concordObject._cql_default_attr
    }}


@app.post("/calBundleDiversity")
def cal_diversity(query: CorpusQuery, db: Session = Depends(get_db)):
    ############ DEBUGGING ##############
    print("calculating diversity...")
    ############ _DEBUGGING ##############
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append([f.file_name, f.file_content])
    allBundles = crud.list_all_bundles(db)
    bundle_str_list = []
    for bundle in allBundles:
        bundle_str_list.append(bundle.bundle_name)
    results_data = cal_lb_stats(corpus, bundle_str_list)
    return {"code": 200, "data": results_data}


@app.post("/calDmDiversity")
def cal_diversity(query: CorpusQuery, db: Session = Depends(get_db)):
    ############ DEBUGGING ##############
    print("calculating diversity...")
    ############ _DEBUGGING ##############
    allFiles = crud.list_all_files_in_ids(db, query.fileIds)
    corpus = []
    for f in allFiles:
        # print(f.file_json)
        corpus.append([f.file_name, f.file_content])
    allDms = crud.list_all_markers(db)
    dm_str_list = []
    for dm in allDms:
        dm_str_list.append([dm.marker_name, dm.category, dm.sub_category])
    results_data = cal_dm_stats(corpus, dm_str_list)
    return {"code": 200, "data": results_data}


if __name__ == "__main__":
    # os.system('lexicon.exe')
    # print("before done")
    uvicorn.run(app="main:app", host="0.0.0.0", port=9999)
    # print("done")
