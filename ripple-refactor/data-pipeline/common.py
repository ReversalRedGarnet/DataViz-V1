"""
Shared scope and column-matching helpers for the cleaning scripts.

Both cleaners answer the same two questions before they can do anything else:
*which rows are in scope* and *what are the columns called this time*. Those
answers have to agree, or the two JSON files they produce describe different
countries over different years and every cross-dataset comparison on the site
is quietly wrong. Keeping them in one module is what makes that agreement
structural rather than a thing to remember.
"""

from pathlib import Path

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
