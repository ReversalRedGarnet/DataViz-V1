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
    # Fiji is deliberately absent: it had forecast coverage only, with no damage
    # assessment published. Kept in step with src/content/storms.js, which is
    # the roster of record -- a roster that disagrees with itself across two
    # files in the repo is exactly what the exclusions section exists to rule
    # out.
    ("Judy & Kevin", 2023, ["Vanuatu", "Solomon Islands"]),
    ("Lola", 2023, ["Vanuatu", "Solomon Islands"]),
]

# Several metrics below come out of the same portal dataflow, and the portal
# exports whole dataflows rather than single indicators. Rather than asking for
# nine identical copies of two files, each dataset lists the filenames it will
# accept and the first one present wins. That means the five files already in
# raw/ serve all ten metrics -- adding an indicator costs a DATASETS entry, not
# another download.
CLIMATE_CSVS = [
    "climate_change_indicators.csv",
    "crop_yield.csv",
    "power_generation.csv",
    "tourist_arrivals.csv",
]
SDG11_CSVS = [
    "sdg_11.csv",
    "disaster_affected_persons.csv",
    "disaster_economic_loss.csv",
]

# Dataset configuration: output JSON + which indicator to pull from which dump.
#
# Grouped the way the site groups them, because the grouping is an argument
# rather than a filing convenience. The chain metrics are consequences of a
# disaster, and they are the patchy ones -- consequence data depends on a
# country having the capacity to assess and report after being hit, which is
# precisely what a disaster destroys and precisely what the least-resourced
# countries have least of. The capacity and context metrics are complete
# because they are structural or satellite-derived and need nobody to file a
# return. That asymmetry is not an inconvenience in the data; it is one of the
# things the data says.
DATASETS = {
    "disaster_affected_persons.csv": {
        "csv_candidates": SDG11_CSVS,
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
        "csv_candidates": SDG11_CSVS,
        "json_name": "disaster_economic_loss.json",
        "field_name": "economic_loss_usd",
        "indicator_col": "INDICATOR",
        "indicator_code": "VC_DSR_AALT",

        # Ignore rows reported in USD_MILLIONS to avoid mixing units.
        "unit_col": "UNIT_MEASURE",
        "unit_value": "USD",
    },
    "crop_yield.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "crop_yield.json",
        "field_name": "crop_yield_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "CROP_YIELD",
    },
    "tourist_arrivals.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "tourist_arrivals.json",
        "field_name": "tourist_arrivals_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "TRSM_ARR",
    },
    "power_generation.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "power_generation.json",
        "field_name": "power_generation_index",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "POWER_GEN",
    },

    # --- Chain, continued -------------------------------------------------
    # Livestock yield sits beside crop yield so the food-system link rests on
    # two records instead of one. Complete for all four nations, 2013-2024.
    "livestock_yield.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "livestock_yield.json",
        "field_name": "livestock_yield_kg",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "LVST_YIELD",
    },

    # --- Capacity ---------------------------------------------------------
    # Number of meteorological monitoring stations. Flat across the whole
    # period -- Fiji 8, Vanuatu 6, Tonga 4, Solomon Islands 3 -- which is what
    # makes it useful: it is not a trend, it is a standing difference in who
    # can observe their own weather. Line it up against the gaps in the chain
    # metrics above and the ranking is the same. This is the series that turns
    # "coverage varies by country" from an apology into a finding.
    "meteo_stations.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "meteo_stations.json",
        "field_name": "stations",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "METEO_MONITOR_NET",
    },

    # --- Physical context -------------------------------------------------
    # Sea surface temperature anomaly, in degrees C. The physical driver behind
    # the one cyclone claim that is well supported: IPCC AR6 finds it likely
    # that the proportion of Category 3-5 tropical cyclones has risen over the
    # past four decades.
    #
    # Read as a trend, never per storm. The 2015 anomaly is NEGATIVE in three
    # of four nations, and 2015 is the year of Cyclone Pam -- so a per-storm
    # reading of this series immediately contradicts itself. The site must say
    # warming raises the ceiling on intensity, not that a warm year produced a
    # given storm.
    "sst_anomaly.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "sst_anomaly.json",
        "field_name": "sst_anomaly_c",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "SST_ANOM",
    },

    # Sea level anomaly was exported and then cut. The portal reports it to
    # the nearest 0.1 m, which across this period yields three distinct values
    # and hides any movement under 10 cm. It underwrites the best-attributed
    # mechanism available -- higher seas carry a storm surge further inland,
    # and IPCC AR6 rates the human contribution to sea level rise since 1971
    # very likely -- but a chart at that resolution claims more precision than
    # the record has. The sentence is stronger than the chart, so the point is
    # made in the section copy instead. Re-add SEA_LVL here if a
    # finer-grained source turns up.

    # Greenhouse gas emissions per head, in tonnes. The one indicator here that
    # is about responsibility rather than exposure.
    #
    # Handle the copy carefully: Solomon Islands is around 0.8 t and genuinely
    # low, but Fiji is around 3.0 and Tonga 2.8, which are not negligible
    # globally. "These nations emit almost nothing" would be false for three of
    # the four. Any comparator figure put on the page needs its own source.
    "ghg_per_capita.csv": {
        "csv_candidates": CLIMATE_CSVS,
        "json_name": "ghg_per_capita.json",
        "field_name": "ghg_tonnes_per_capita",
        "indicator_col": "CLIMATE_CHANGE_INDICATORS",
        "indicator_code": "GHG_EMI_CAPITA",
    },
}

def _resolve_source(csv_name: str, config: dict):
    """First filename in this dataset's candidate list that exists in raw/."""
    for candidate in config.get("csv_candidates", [csv_name]):
        path = RAW_DIR / candidate
        if path.exists():
            return path
    return None


def clean_one(path, config: dict) -> list:
    """Clean a single dataset, export it as JSON, and return the rows."""
    df = pd.read_csv(path, low_memory=False)

    print(f"\n{config['json_name']} (from {path.name})")

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

    country_col = find_col(df, COUNTRY_COL_CANDIDATES, "country")
    time_col = find_col(df, TIME_COL_CANDIDATES, "year")
    value_col = find_col(df, VALUE_COL_CANDIDATES, "value")

    rows = []
    dropped_zeros = []

    for nation in NATIONS:
        matched = df[df[country_col].apply(matches_nation, args=(nation,))]
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
        path = _resolve_source(csv_name, config)

        if path is None:
            candidates = config.get("csv_candidates", [csv_name])
            print(f"Skipping {config['json_name']} -- none of {candidates} in {RAW_DIR}.")
            continue

        any_found = True

        try:
            cleaned[csv_name] = clean_one(path, config)
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
