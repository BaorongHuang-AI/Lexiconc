import sqlite3

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 数据类型
# NULL
# INTEGER 整数
# REAL  浮点值
# TEXT 文字
# BLOB 二进制大对象

def do_conn():
    db_file = "sqlite://./sqliteutils/online-align.db"
    try:
        conn = sqlite3.connect(db_file)
        print("OK")
        return conn
    except Exception as e:
        print(e)

def init_db():
    conn = do_conn()
    init_sql = '''CREATE TABLE IF NOT EXISTS project(
        id INT PRIMARY KEY NOT NULL,
        name VARCHAR NOT NULL,
        src_lang VARCHAR,
        tgt_lang VARCHAR,
        src_file VARCHAR,
        tgt_file VARCHAR,
        created_at DATE,
        updated_at DATE
    )'''
    conn.execute(init_sql)
    init_data = ''
    conn.close()

if __name__ == "__main__":
    init_db()
    do_conn()


