#!/usr/bin/env python3
"""
Gera arquivos CSV por tabela a partir do SQLite e cria um arquivo `import_postgres.sql`
com comandos COPY para importar no Postgres.

Uso:
  python3 sqlite_to_postgres.py /path/to/database.sqlite /output/folder

Observações:
 - Requer Python3, módulo sqlite3 (builtin) e csv (builtin).
 - Depois, rode `psql -d yourdb -f import_postgres.sql` e `psql -d yourdb -c "\copy table FROM 'table.csv' CSV HEADER"`
 - O script gera `schema_sqlite.sql` com o schema original e `import_postgres.sql` com instruções.
"""
import sys
import os
import sqlite3
import csv


def export_tables(db_path, out_dir):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Cria diretório
    os.makedirs(out_dir, exist_ok=True)

    # Export schema
    schema_path = os.path.join(out_dir, 'schema_sqlite.sql')
    with open(schema_path, 'w', encoding='utf-8') as f_schema:
        for line in conn.iterdump():
            f_schema.write(line + '\n')

    # Lista tabelas
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [r[0] for r in cur.fetchall()]

    import_sql_path = os.path.join(out_dir, 'import_postgres.sql')
    with open(import_sql_path, 'w', encoding='utf-8') as f_import:
        f_import.write('-- Arquivo gerado por sqlite_to_postgres.py\n')
        f_import.write('-- Ajuste tipos no schema conforme necessário antes de executar\n\n')

        for table in tables:
            cur.execute(f'PRAGMA table_info("{table}")')
            cols = cur.fetchall()
            col_names = [c[1] for c in cols]

            csv_path = os.path.join(out_dir, f'{table}.csv')
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
                writer.writerow(col_names)
                cur.execute(f'SELECT * FROM "{table}"')
                for row in cur.fetchall():
                    # Normalize bytes to str
                    newrow = []
                    for v in row:
                        if isinstance(v, (bytes, bytearray)):
                            try:
                                newrow.append(v.decode('utf-8'))
                            except Exception:
                                newrow.append(str(v))
                        else:
                            newrow.append(v)
                    writer.writerow(newrow)

            f_import.write(f"-- Import table {table}\n")
            f_import.write(f"\copy {table} ({', '.join(col_names)}) FROM '{csv_path}' CSV HEADER;\n\n")

    print('Export completo em:', out_dir)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print('Uso: sqlite_to_postgres.py /path/to/db.sqlite /output/dir')
        sys.exit(1)
    db = sys.argv[1]
    out = sys.argv[2]
    if not os.path.isfile(db):
        print('Arquivo sqlite não encontrado:', db)
        sys.exit(2)
    export_tables(db, out)
