"""
scheduler.py
============
APScheduler orchestrating two separate pipelines:

  HOURLY  (every hour)
    → fetch_exchangerates   (live FX rates + 90-day volatility)
    → compute_stress_score  (refresh risk scores from latest data)

  WEEKLY  (Monday 06:00 UTC)
    → fetch_worldbank       (annual/quarterly macroeconomic indicators)
    → compute_stress_score  (full recompute after WB refresh)

Usage:
    python scheduler.py
"""

import logging
from datetime import datetime, timezone

from apscheduler.schedulers.blocking import BlockingScheduler

from fetch_worldbank import run as run_worldbank
from fetch_exchangerates import run as run_exchangerates
from compute_stress_score import run as run_stress

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)


def hourly_pipeline():
    """Fetch live FX rates and recompute stress scores every hour."""
    start = datetime.now(timezone.utc)
    log.info("⚡  Hourly pipeline started at %s", start.isoformat())
    errors = []

    try:
        run_exchangerates()
    except Exception as exc:
        log.error("❌  Exchange-rate fetch failed: %s", exc)
        errors.append(("exchangerates", str(exc)))

    try:
        run_stress()
    except Exception as exc:
        log.error("❌  Stress-score computation failed: %s", exc)
        errors.append(("stress_score", str(exc)))

    elapsed = (datetime.now(timezone.utc) - start).total_seconds()
    if errors:
        log.warning("⚠  Hourly pipeline finished with %d error(s) in %.1fs", len(errors), elapsed)
    else:
        log.info("✅  Hourly pipeline done in %.1fs", elapsed)


def weekly_pipeline():
    """Fetch World Bank macroeconomic data and recompute all scores."""
    start = datetime.now(timezone.utc)
    log.info("═══════════════════════════════════════════")
    log.info("🚀  Weekly pipeline started at %s", start.isoformat())
    log.info("═══════════════════════════════════════════")
    errors = []

    try:
        run_worldbank()
    except Exception as exc:
        log.error("❌  World Bank fetch failed: %s", exc)
        errors.append(("worldbank", str(exc)))

    try:
        run_stress()
    except Exception as exc:
        log.error("❌  Stress-score computation failed: %s", exc)
        errors.append(("stress_score", str(exc)))

    elapsed = (datetime.now(timezone.utc) - start).total_seconds()
    log.info("═══════════════════════════════════════════")
    if errors:
        log.warning("⚠  Weekly pipeline finished with %d error(s) in %.1fs", len(errors), elapsed)
        for name, msg in errors:
            log.warning("   • %s: %s", name, msg)
    else:
        log.info("✅  Weekly pipeline finished successfully in %.1fs", elapsed)
    log.info("═══════════════════════════════════════════")


if __name__ == "__main__":
    log.info("🕐  Running initial pipeline …")
    hourly_pipeline()

    scheduler = BlockingScheduler()

    # Hourly: FX + stress scores
    scheduler.add_job(
        hourly_pipeline,
        "interval",
        hours=1,
        id="hourly_pipeline",
    )

    # Weekly: World Bank full refresh (Monday 06:00 UTC)
    scheduler.add_job(
        weekly_pipeline,
        "cron",
        day_of_week="mon",
        hour=6,
        minute=0,
        timezone="UTC",
        id="weekly_pipeline",
    )

    log.info("📅  Scheduler started — hourly FX refresh + weekly World Bank refresh")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("👋  Scheduler stopped.")
