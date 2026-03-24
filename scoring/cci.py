def score_cci(
    voting_pct_insider: float,
    dual_class: bool,
    float_pct: float,
    ev_to_mktcap: float,
    net_debt_to_ebitda: float,
    sector_stigma: float,
    multiple_gap: float,
) -> dict:
    ccs = min(100, (voting_pct_insider / 100) * 50 + (30 if dual_class else 0) + 20)
    fds = min(100, max(0, 100 - float_pct))
    eei = min(
        100,
        max(
            0,
            min(50, max(0, ev_to_mktcap - 1) * 12)
            + min(30, max(0, net_debt_to_ebitda) * 5)
            + 20,
        ),
    )
    nds = min(100, max(0, (sector_stigma * 0.5) + (multiple_gap * 0.5)))

    composite = 0.25 * ccs + 0.20 * fds + 0.30 * eei + 0.25 * nds

    band = (
        "Extreme Compression" if composite >= 80 else
        "High Distortion" if composite >= 60 else
        "Moderate Distortion" if composite >= 30 else
        "Clean Structure"
    )

    return {
        "cci": round(composite, 2),
        "ccs": round(ccs, 2),
        "fds": round(fds, 2),
        "eei": round(eei, 2),
        "nds": round(nds, 2),
        "band": band,
    }
