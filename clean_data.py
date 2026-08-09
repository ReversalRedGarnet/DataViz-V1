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
#
# Opens in 2013, not 2016: the storm roster now starts at Cyclone Pam (March
# 2015), and a chart of an event year is meaningless without baseline years
# before it. Two clear years ahead of the earliest storm is the minimum that
# lets a reader see what "normal" looked like first.
#
# Widening this costs nothing at export time -- the portal dumps whole
# dataflows and this script does the filtering -- so the only reason not to
# reach further back is that the older figures get patchier.
YEAR_MIN = 2013
YEAR_MAX = 2024

# The storm roster, for the coverage report at the end of a run. Each entry is
# the year a chart would have to anchor on, and the in-scope nations that storm
# actually struck. This is not used to filter anything: it exists so a run
# prints, in plain terms, which storms the exported data can and cannot support
# -- the question that decides what the site is able to show.
#
# The rule these were picked under: severe tropical cyclone, landfall or major
# impact in two or more of the four in-scope nations, since 2015. Applied
# evenly rather than picked for the story, which means it also throws out
# storms that would have suited it:
#
#   Ana (2021), Cody (2022)  -- Fiji only
#   Rae (2022)               -- minor, no fatalities
#   Yasa (2020)              -- severe, and it would have strengthened the
#                               "2020 was relentless" beat, but within these
#                               four nations it struck Fiji alone and so fails
#                               the same two-nation test the others passed.
#
# Keeping Yasa because it helped the argument is exactly the bias the rule
# exists to prevent. The exclusions belong on the site itself: stating what was
# left out, and why, is what makes the roster defensible rather than
# cherry-picked. Six storms, five of them in 2020 and 2023.
STORMS = [
    ("Pam", 2015, ["Vanuatu", "Solomon Islands"]),
    ("Winston", 2016, ["Fiji", "Tonga"]),
    ("Gita", 2018, ["Tonga", "Fiji"]),
    ("Harold", 2020, ["Solomon Islands", "Vanuatu", "Fiji", "Tonga"]),
    ("Judy & Kevin", 2023, ["Vanuatu", "Solomon Islands", "Fiji"]),
    ("Lola", 2023, ["Vanuatu", "Solomon Islands"]),
]

# Dataset configuration:
# raw CSV -> output JSON + indicator selection.
DATASETS = {
    "disaster_affected_persons.csv": {
        "json_name": "disaster_affected_persons.json",
        "field_name": "affected_persons",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AFFCT",

        # Drop rows reported as exactly 0. This series does not distinguish
        # "nobody was affected" from "nothing was reported", and across this
        # roster the difference is not subtle: Vanuatu's figure for 2015, the
        # year Cyclone Pam became the most destructive storm in its history, is
        # 0. So is Tonga's for 2016, and Fiji's for 2015 and 2017.
        #
        # A blank in a chart reads as "not measured". A zero bar reads as
        # "nothing happened" -- a claim the chart makes on its own authority,
        # and in these cases a false one. Given the series cannot tell the two
        # apart, the honest move is to decline to assert either.
        #
        # Applied uniformly to every zero in this metric rather than only to
        # the nation-years we happen to know a storm struck. Overriding the
        # official source case by case, using our own roster to decide which
        # zeros are "wrong", would be us editing the data to match what we
        # already believe. A blanket rule states one checkable thing -- this
        # series does not distinguish absent from none -- and needs no
        # judgement about any individual figure.
        #
        # The consequence has to be said on the site, not buried here: some
        # nation-years are missing from these charts because nothing was
        # reported, and the countries with the least capacity to report are the
        # ones most often missing. See the caveat in src/utils/metrics.js.
        "zero_is_missing": True,
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


def clean_one(csv_name: str, config: dict) -> list:
    """Clean a single dataset, export it as JSON, and return the rows."""
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
    dropped_zeros = []

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
            value = row[value_col]

            # See "zero_is_missing" in this dataset's config for why.
            if config.get("zero_is_missing") and pd.to_numeric(value, errors="coerce") == 0:
                dropped_zeros.append((nation, int(row[time_col])))
                continue

            rows.append({
                "nation": nation,
                "year": int(row[time_col]),
                config["field_name"]: value,
            })

    if dropped_zeros:
        print(
            f"  dropped {len(dropped_zeros)} zero-valued nation-years as "
            f"unreported: {sorted(dropped_zeros)}"
        )

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUT_DIR / config["json_name"], "w") as f:
        json.dump(rows, f, indent=2)

    print(f"  wrote {config['json_name']} ({len(rows)} rows total)")
    return rows


def report_coverage(cleaned: dict) -> None:
    """Print what the exported data actually covers, per metric and per storm.

    Every dataset here has real gaps, and the gaps are not a flaw to hide --
    they are part of what the site says. But a gap has to be known before it can
    be shown honestly, and a silent one becomes a chart that implies a
    measurement nobody made. This prints them up front so a re-export can be
    judged before anything is built on it.
    """
    print("\n" + "=" * 72)
    print("COVERAGE BY METRIC")
    print("=" * 72)

    for csv_name, rows in cleaned.items():
        config = DATASETS[csv_name]
        print(f"\n{config['json_name']}")
        for nation in NATIONS:
            years = sorted(r["year"] for r in rows if r["nation"] == nation)
            if not years:
                print(f"  {nation:<17} NO DATA AT ALL")
                continue
            gaps = [y for y in range(min(years), max(years) + 1) if y not in years]
            line = f"  {nation:<17} {min(years)}-{max(years)}  ({len(years)} of {YEAR_MAX - YEAR_MIN + 1} years)"
            if gaps:
                line += f"  gaps: {gaps}"
            print(line)

    print("\n" + "=" * 72)
    print("COVERAGE BY STORM")
    print("=" * 72)
    print("A storm is supportable for a metric when every in-scope nation it")
    print("struck has a figure for the storm's own year. Anything less and that")
    print("storm's chart would be comparing a country against a blank.\n")

    for name, year, nations in STORMS:
        print(f"{name} ({year}) -- {', '.join(nations)}")
        for csv_name, rows in cleaned.items():
            have = {r["nation"] for r in rows if r["year"] == year}
            missing = [n for n in nations if n not in have]
            metric = DATASETS[csv_name]["json_name"].replace(".json", "")
            if not missing:
                print(f"    OK       {metric}")
            elif len(missing) == len(nations):
                print(f"    NONE     {metric}")
            else:
                print(f"    PARTIAL  {metric}  -- missing {', '.join(missing)}")
        print()


def main() -> None:
    any_found = False
    problems = []
    cleaned = {}

    for csv_name, config in DATASETS.items():
        path = RAW_DIR / csv_name

        if not path.exists():
            print(f"Skipping {csv_name} -- not found in {RAW_DIR}.")
            continue

        any_found = True

        try:
            cleaned[csv_name] = clean_one(csv_name, config)
        except KeyError as e:
            print(f"  PROBLEM in {csv_name}: {e}")
            problems.append(csv_name)

    if not any_found:
        print("\nNo raw CSVs found yet.")
        return

    if problems:
        print(f"\n{len(problems)} file(s) need attention: {problems}")
    else:
        print("\nAll datasets cleaned.")

    if cleaned:
        report_coverage(cleaned)


if __name__ == "__main__":
    main()
