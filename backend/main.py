from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # CORS
from fastapi.middleware.gzip import GZipMiddleware  # gZip

import sqlite3

app = FastAPI()

app.add_middleware(GZipMiddleware, minimum_size=1000)  # gZip

origins = [ # CORS
    "*",
]

app.add_middleware(  # CORS
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_LOCATION = "./cities_index.sqlite"

con = sqlite3.connect(DB_LOCATION)
con.row_factory
cur = con.cursor()


@app.get("/")
def root():
    return "Hello World!"

@app.get("/cities/{year}")
async def cities_by_year(year):
    cur.execute(
        """SELECT
                id,
                name,
                longitude,
                latitude,
                people_count,
                total_points,
                group_name
            FROM cities
            WHERE year = :year
        """,
        {
            "year": year
        }
    )

    cities = cur.fetchall()

    features = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [row[2], row[3]]
                },
                "properties": {
                    "id": row[0],
                    "name": row[1],
                    "people_count": row[4],
                    "total_points": row[5],
                    "group_name": row[6]
                }
            }
            for row in cities
        ]
    }

    return features

@app.get("/city/{id}")
async def details_by_id(id):
    cur.execute(
        """SELECT
                id,
                name,
                people_count,
                total_points,
                house_points,
                street_points,
                park_points,
                business_points,
                social_points,
                common_points,
                emblem_url
            FROM cities
            WHERE id = :id
        """,
        {
            "id": id
        }
    )

    city_row = cur.fetchone()

    return {
            "id": city_row[0],
            "name": city_row[1],
            "people_count": city_row[2],
            "total_points": city_row[3],
            "house_points": city_row[4],
            "street_points": city_row[5],
            "park_points": city_row[6],
            "business_points": city_row[7],
            "social_points": city_row[8],
            "common_points": city_row[9],
            "emblem_url": city_row[10]
    }
