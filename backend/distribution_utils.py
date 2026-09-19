"""Distribution dates are entered in the warehouse's WITA timezone."""
from datetime import datetime, date, time, timedelta, timezone

from fastapi import HTTPException

WITA = timezone(timedelta(hours=8))


def distribution_occurred_at(date_value=None, time_value=None):
    now = datetime.now(timezone.utc)
    local_now = now.astimezone(WITA)
    try:
        day = date.fromisoformat(date_value) if date_value else local_now.date()
        clock = time.fromisoformat(time_value) if time_value else local_now.time()
        occurred = datetime.combine(day, clock, tzinfo=WITA).astimezone(timezone.utc)
    except (ValueError, TypeError):
        raise HTTPException(400, "Tanggal atau waktu penyaluran tidak valid. Gunakan YYYY-MM-DD dan HH:MM (WITA).")
    if occurred > now:
        raise HTTPException(400, "Waktu penyaluran tidak boleh berada di masa depan.")
    return occurred