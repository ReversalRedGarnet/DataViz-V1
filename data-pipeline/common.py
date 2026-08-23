"""
Shared scope and column-matching helpers for the cleaning scripts.

Both cleaners answer the same two questions before they can do anything else:
*which rows are in scope* and *what are the columns called this time*. Those
answers have to agree, or the two JSON files they produce describe different
countries over different years and every cross-dataset comparison on the site
is quietly wrong. Keeping them in one module is what makes that agreement
structural rather than a thing to remember.

SCOPE IS NOT DEFINED HERE. The nation list, the ISO codes, the year window and
the storm roster are read from src/content/nations.json and
src/content/roster.json -- the same two files the site reads. They used to be
typed out again in this folder, which made "the pipeline and the site agree
about which countries, which years and which storms" something a person had to
notice rather than something true by construction. Editing scope now means
editing one file and re-running.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

# The shared scope files, which the site reads too. See the _comment key in
# each for what belongs in it.
CONTENT_DIR = Path(__file__).parent.parent / "src" / "content"


def _load_scope(filename):
    path = CONTENT_DIR / filename
    if not path.exists():
        raise SystemExit(
            f"{path} not found. It is the shared scope file the site reads as "
            "well; this script cannot decide the project's scope on its own."
        )
    return json.loads(path.read_text())


_NATIONS = _load_scope("nations.json")["nations"]
_ROSTER = _load_scope("roster.json")

# Project scope. The order matches the site's, which is the order every chart
# sorts its rows into, so the JSON comes out in the order it is drawn.
NATIONS = [n["name"] for n in _NATIONS]

NATION_CODES = {n["name"]: list(n["codes"]) for n in _NATIONS}

# Analysis period. Opens before the roster does on purpose: a chart of an event
# year is meaningless without baseline years before it. See roster.json.
YEAR_MIN = _ROSTER["yearMin"]
YEAR_MAX = _ROSTER["yearMax"]

# The storm roster, for the coverage report at the end of a run. Each entry is
# the year a chart would have to anchor on, and the in-scope nations that storm
# actually struck. Nothing is filtered by it: it exists so a run prints, in
# plain terms, which storms the exported data can and cannot support -- the
# question that decides what the site is able to show.
STORMS = [(s["label"], s["year"], list(s["nations"])) for s in _ROSTER["storms"]]

# Portal exports are not consistent about what they call these three columns,
# so each is looked up by candidate list rather than by name.
COUNTRY_COL_CANDIDATES = [
    "GEO_PICT",
    "REF_AREA",
    "Pacific Island Countries and territories",
    "Country",
]

TIME_COL_CANDIDATES = ["TIME_PERIOD", "Year"]
VALUE_COL_CANDIDATES = ["OBS_VALUE", "Value"]


def find_col(df, candidates, label):
    """Return the first matching column name from a list of candidates."""
    for candidate in candidates:
        if candidate in df.columns:
            return candidate

    raise KeyError(
        f"Couldn't find a {label} column. Columns in this file are: "
        f"{list(df.columns)} -- add the correct column name to the "
        f"candidate list in common.py."
    )


def matches_nation(raw_value, nation) -> bool:
    """Match a country by name or ISO code."""
    raw_value = str(raw_value).strip()

    if raw_value.lower() == nation.lower():
        return True

    return raw_value.upper() in NATION_CODES.get(nation, [])


def coerce_year(raw_value):
    """A year as an int, or None if this row's period isn't one.

    Portal exports have carried period strings like "2015-01" before now, and a
    bare .astype(int) on a column holding one raises ValueError -- which
    clean_data.py's main() does not catch, so one odd row aborted the entire run
    instead of being reported as one bad dataset.
    """
    try:
        return int(str(raw_value).strip())
    except (TypeError, ValueError):
        return None


def coerce_value(raw_value):
    """A figure as a float, or None if it is blank or non-numeric.

    THIS IS WHY IT EXISTS. Values used to be written to JSON exactly as pandas
    read them. An empty cell arrives as NaN, and json.dump writes NaN as a bare
    literal, which is not valid JSON. JSON.parse rejects it, res.json() throws
    inside loadDataset, and because useMetricData loads every dataset with
    Promise.all, a single empty cell in a single re-export would blank every
    chart on the site at once.

    Returning None instead drops the row, and the coverage report at the end of
    a run prints the resulting gap -- which is the honest outcome, and a visible
    one.
    """
    value = pd.to_numeric(raw_value, errors="coerce")
    if pd.isna(value):
        return None
    return float(value)


def extract_rows(df, country_col, time_col, value_col, field_name, zero_is_missing=False):
    """In-scope nation-years as flat {nation, year, field} dicts.

    Shared because both cleaners walk the same filter-by-nation,
    filter-by-year, coerce-the-value path, and only one of them was walking it
    correctly.

    Returns (rows, report) where report carries the counts a run should print:
    per-nation match totals, values that could not be read as numbers, and any
    zeros dropped under zero_is_missing.
    """
    rows = []
    report = {"per_nation": [], "unreadable": 0, "dropped_zeros": []}

    for nation in NATIONS:
        matched = df[df[country_col].apply(matches_nation, args=(nation,))]
        in_range = 0

        for _, row in matched.iterrows():
            year = coerce_year(row[time_col])
            if year is None or not (YEAR_MIN <= year <= YEAR_MAX):
                continue
            in_range += 1

            value = coerce_value(row[value_col])
            if value is None:
                report["unreadable"] += 1
                continue

            # See "zero_is_missing" in the dataset's config for why.
            if zero_is_missing and value == 0:
                report["dropped_zeros"].append((nation, year))
                continue

            rows.append({"nation": nation, "year": year, field_name: value})

        report["per_nation"].append((nation, len(matched), in_range))

    return rows, report


def write_json(path, records):
    """Write records as JSON, refusing to emit anything JSON.parse cannot read.

    allow_nan=False is the belt to coerce_value's braces: if a non-finite value
    ever reaches this point the run fails here, loudly, rather than writing a
    file that looks fine on disk and breaks the site on load.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, indent=2, allow_nan=False) + "\n")
