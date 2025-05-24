import pandas as pd

from sqliteutils.crud import delete_bundle_list, save_bundle, delete_dm_list, save_dm


def save_lexiExcel(file_name, db):
    delete_bundle_list(db)
    df = pd.read_excel(file_name)
    results = []
    for index, row in df.iterrows():
        print(row[0])
        save_bundle(db, row[0])
        results.append(row[0])
    return results


def save_dmExcel(file_name, db):
    delete_dm_list(db)
    df = pd.read_excel(file_name)
    results = []
    for index, row in df.iterrows():
        print(row[0])
        save_dm(db, row[0], row[1], row[2])
        results.append([row[0], row[1], row[2]])
    return results


