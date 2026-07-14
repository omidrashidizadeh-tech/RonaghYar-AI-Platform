from dataclasses import dataclass

@dataclass(frozen=True)
class Plan:
    name: str; daily_limit: int; outputs: int; advanced: bool; quality: bool

PLANS = {
    "FREE": Plan("FREE", 5, 1, False, False),
    "PRO": Plan("PRO", 100, 3, True, True),
    "BUSINESS": Plan("BUSINESS", 500, 5, True, True),
}

def get_plan(name: str | None) -> Plan:
    return PLANS.get((name or "FREE").upper(), PLANS["FREE"])
