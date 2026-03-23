def score_eci(
    gross_margin: float,
    ebitda_margin: float,
    revenue_growth: float,
    insider_ownership_pct: float,
    institutional_ownership_pct: float,
    dilution_3y_pct: float,
    leverage_ratio: float,
) -> dict:
    eds = max(0, min(100, gross_margin * 0.6 + ebitda_margin * 0.8))
    csis = max(0, min(100, insider_ownership_pct * 0.7 + institutional_ownership_pct * 0.2))
    giis = max(0, min(100, revenue_growth * 2 + max(0, 30 - dilution_3y_pct)))
    lpss = max(0, min(100, 100 - leverage_ratio * 12))
    res = max(0, min(100, (eds * 0.4) + (giis * 0.3) + (lpss * 0.3)))

    eci = (eds + csis + giis + lpss + res) / 5

    return {
        "eci": round(eci, 2),
        "eds": round(eds, 2),
        "csis": round(csis, 2),
        "giis": round(giis, 2),
        "lpss": round(lpss, 2),
        "res": round(res, 2),
    }
