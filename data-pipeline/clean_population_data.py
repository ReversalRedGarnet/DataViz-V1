"""
Convert a Pacific Data Hub population export into the JSON the frontend would
need to show impact per head of population.

Why this exists
---------------
"People affected" is currently a raw count, and raw counts flatten the thing
this site is about. In 2020 Vanuatu reported roughly 246,800 people affected
and Fiji roughly 235,900 -- numbers close enough to read as equivalent. Against
their populations they are not close at all: Vanuatu's figure is a large share
of the whole country, Fiji's a much smaller one. A chart that shows those two
bars at the same height is telling the reader the opposite of what happened.

Fixing that needs a denominator, and the denominator has to be real. This
script is the pipeline half, ready to run. Nothing in the site consumes
population.json yet, deliberately: the numbers have to come from the portal
before anything is built on top of them, and no figures are hardcoded here.

Usage
-----
1. At https://stats.pacificdata.org/ export the mid-year population estimates
   for Solomon Islands, Vanuatu, Fiji and Tonga across 2016-2024 into
   data-pipeline/raw/population.csv
2. Run:
       python clean_population_data.py
3. Check the printed coverage table. Every nation-year the site charts needs a
   population figure, or the per-capita version of that chart has to fall back
   to the raw count rather than silently dropping a country.
4. public/data/population.json is written in the same shape as every other
   dataset here: a flat list of { nation, year, population }.

The indicator code below is the one to check first if the export comes back
empty -- portal indicator codes change, and this script prints what it found
rather than guessing.
"""

import json

import pandas as pd

from common import (
    COUNTRY_COL_CANDIDATES,
    NATIONS,
    OUT_DIR,
    RAW_DIR,
    TIME_COL_CANDIDATES,
    VALUE_COL_CANDIDATES,
    YEAR_MAX,
    YEAR_MIN,
    find_col,
    matches_nation,
)

RAW_FILE = "population.csv"
OUT_FILE = "population.json"
FIELD_NAME = "population"

# Mid-year total population. Set to None to accept whatever single indicator
# the export contains, which is often simpler than matching a code.
INDICATOR_COL = "INDICATOR"
INDICATOR_CODE = "MIDYEARPOPEST"

# Total, not a breakdown: an export left at its default filters may carry sex
# and age dimensions, and summing across them would double count.
DIMENSION_TOTALS = {"SEX": "_T", "AGE": "_T", "URBANIZATION": "_T"}


def clean_population() -> None:
    path = RAW_DIR / RAW_FILE
    if not path.exists():
        raise SystemExit(
            f"{path} not found. Export mid-year population estimates from "
            "https://stats.pacificdata.org/ and save them there first."
        )

    df = pd.read_csv(path)
    print(f"{RAW_FILE}: columns found -> {list(df.columns)}")

    if INDICATOR_CODE and INDICATOR_COL in df.columns:
        found = sorted(df[INDICATOR_COL].dropna().unique())
        print(f"  indicators present -> {found}")
        if INDICATOR_CODE not in found:
            raise SystemExit(
                f"Indicator {INDICATOR_CODE!r} isn't in this export. Pick one "
                f"of {found} and set INDICATOR_CODE at the top of this file."
            )
        df = df[df[INDICATOR_COL] == INDICATOR_CODE]

    # Drop any breakdown rows, so a nation-year can't appear more than once.
    for column, total in DIMENSION_TOTALS.items():
        if column in df.columns:
            df = df[df[column] == total]

    country_col = find_col(df, COUNTRY_COL_CANDIDATES, "country")
    time_col = find_col(df, TIME_COL_CANDIDATES, "year")
    value_col = find_col(df, VALUE_COL_CANDIDATES, "value")

    records = []
    for nation in NATIONS:
        rows = df[df[country_col].apply(lambda v: matches_nation(v, nation))]
        for _, row in rows.iterrows():
            year = int(row[time_col])
            if not (YEAR_MIN <= year <= YEAR_MAX):
                continue
            value = pd.to_numeric(row[value_col], errors="coerce")
            if pd.isna(value):
                continue
            records.append({"nation": nation, "year": year, FIELD_NAME: float(value)})

    # A duplicate nation-year here means a dimension wasn't filtered out above.
    seen = {}
    for record in records:
        key = (record["nation"], record["year"])
        if key in seen and seen[key] != record[FIELD_NAME]:
            raise SystemExit(
                f"Two different population figures for {key}. Check "
                "DIMENSION_TOTALS against the columns printed above."
            )
        seen[key] = record[FIELD_NAME]

    records.sort(key=lambda r: (r["nation"], r["year"]))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / OUT_FILE).write_text(json.dumps(records, indent=2) + "\n")

    print(f"\nWrote {len(records)} rows to {OUT_DIR / OUT_FILE}")
    print("\nCoverage:")
    for nation in NATIONS:
        years = sorted(r["year"] for r in records if r["nation"] == nation)
        missing = [y for y in range(YEAR_MIN, YEAR_MAX + 1) if y not in years]
        print(f"  {nation:<17} {len(years)} years" + (f", missing {missing}" if missing else ""))


if __name__ == "__main__":
    clean_population()
