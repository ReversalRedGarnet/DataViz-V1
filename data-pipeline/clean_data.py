"""
Convert Pacific Data Hub CSV exports into the JSON format used by the frontend.

Usage:
1. Export each dataset from https://stats.pacificdata.org/ into
   data-pipeline/raw/ using the filenames defined in DATASETS.
2. Run:
       python clean_data.py
3. Cleaned JSON files are written to ../public/data/.

Some portal exports contain multiple indicators in a single CSV. The
configuration below selects the required indicator (and unit where needed)
for each dataset.
"""

import json
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent.parent / "public" / "data"

# Project scope.
NATIONS = ["Solomon Islands", "Vanuatu", "Fiji", "Tonga"]

NATION_CODES = {
    "Solomon Islands": ["SB", "SLB"],
    "Vanuatu": ["VU", "VUT"],
    "Fiji": ["FJ", "FJI"],
    "Tonga": ["TO", "TON"],
}

# Analysis period.
YEAR_MIN = 2016
YEAR_MAX = 2024

# Dataset configuration:
# raw CSV -> output JSON + indicator selection.
DATASETS = {
    "disaster_affected_persons.csv": {
        "json_name": "disaster_affected_persons.json",
        "field_name": "affected_persons",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AFFCT",
    },
    "disaster_economic_loss.csv": {
        "json_name": "disaster_economic_loss.json",
        "field_name": "economic_loss_usd",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AALT",

        # Ignore rows reported in USD_MILLIONS to avoid mixing units.
        "unit_col": "UNIT_MEASURE",
        "unit_value": "USD",
    },
    "crop_yield.csv": {
        "json_name": "crop_yield.json",
        "field_name": "crop_yield_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "CROP_YIELD",
    },
    "tourist_arrivals.csv": {
        "json_name": "tourist_arrivals.json",
        "field_name": "tourist_arrivals_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "TRSM_ARR",
    },
    "power_generation.csv": {
        "json_name": "power_generation.json",
        "field_name": "power_generation_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "POWER_GEN",
    },
}

COUNTRY_COL_CANDIDATES = [
    "GEO_PICT",
    "REF_AREA",
    "Pacific Island Countries and territories",
    "Country",
]

TIME_COL_CANDIDATES = ["TIME_PERIOD", "Year"]
VALUE_COL_CANDIDATES = ["OBS_VALUE", "Value"]


def _find_col(df, candidates, label):
    """Return the first matching column name from a list of candidates."""
    for candidate in candidates:
        if candidate in df.columns:
            return candidate

    raise KeyError(
        f"Couldn't find a {label} column. Columns in this file are: "
        f"{list(df.columns)} -- add the correct column name to the "
        f"candidate list near the top of this file."
    )


def _matches_nation(raw_value, nation) -> bool:
    """Match a country by name or ISO code."""
    raw_value = str(raw_value).strip()

    if raw_value.lower() == nation.lower():
        return True

    return raw_value.upper() in NATION_CODES.get(nation, [])


def clean_one(csv_name: str, config: dict) -> None:
    """Clean a single dataset and export it as JSON."""
    df = pd.read_csv(RAW_DIR / csv_name)

    print(f"\n{csv_name}: columns found -> {list(df.columns)}")

    indicator_col = config["indicator_col"]
    indicator_code = config["indicator_code"]

    if indicator_col not in df.columns:
        raise KeyError(
            f"Expected an '{indicator_col}' column to select "
            f"{indicator_code} -- not found."
        )

    df = df[df[indicator_col] == indicator_code]
    print(f"  filtered to indicator {indicator_code}: {len(df)} rows")

    if "unit_col" in config:
        df = df[df[config["unit_col"]] == config["unit_value"]]
        print(f"  filtered to unit {config['unit_value']}: {len(df)} rows")

    country_col = _find_col(df, COUNTRY_COL_CANDIDATES, "country")
    time_col = _find_col(df, TIME_COL_CANDIDATES, "year")
    value_col = _find_col(df, VALUE_COL_CANDIDATES, "value")

    rows = []

    for nation in NATIONS:
        matched = df[df[country_col].apply(_matches_nation, args=(nation,))]
        in_range = matched[
            matched[time_col].astype(int).between(YEAR_MIN, YEAR_MAX)
        ]

        print(
            f"  {nation}: {len(matched)} rows matched, "
            f"{len(in_range)} within {YEAR_MIN}-{YEAR_MAX}"
        )

        for _, row in in_range.iterrows():
            rows.append({
                "nation": nation,
                "year": int(row[time_col]),
                config["field_name"]: row[value_col],
            })

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUT_DIR / config["json_name"], "w") as f:
        json.dump(rows, f, indent=2)

    print(f"  wrote {config['json_name']} ({len(rows)} rows total)")


def main() -> None:
    any_found = False
    problems = []

    for csv_name, config in DATASETS.items():
        path = RAW_DIR / csv_name

        if not path.exists():
            print(f"Skipping {csv_name} -- not found in {RAW_DIR}.")
            continue

        any_found = True

        try:
            clean_one(csv_name, config)
        except KeyError as e:
            print(f"  PROBLEM in {csv_name}: {e}")
            problems.append(csv_name)

    if not any_found:
        print("\nNo raw CSVs found yet.")
    elif problems:
        print(f"\n{len(problems)} file(s) need attention: {problems}")
    else:
        print("\nAll datasets cleaned.")


if __name__ == "__main__":
    main()
