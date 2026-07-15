from types import SimpleNamespace

from app.api import routes


def test_development_mode_does_not_enforce_daily_limit(monkeypatch):
    monkeypatch.setattr(routes.settings, "app_env", "development")
    monkeypatch.setattr(routes.settings, "enforce_usage_limits", False)

    user = SimpleNamespace(
        usage_date=None,
        daily_usage=9999,
        plan="FREE",
    )

    plan = routes.consume_usage(user)

    assert plan.name == "FREE"
    assert user.daily_usage == 0


def test_production_mode_enforces_daily_limit(monkeypatch):
    monkeypatch.setattr(routes.settings, "app_env", "production")
    monkeypatch.setattr(routes.settings, "enforce_usage_limits", True)

    user = SimpleNamespace(
        usage_date=routes.date.today().isoformat(),
        daily_usage=5,
        plan="FREE",
    )

    try:
        routes.consume_usage(user)
    except Exception as exc:
        assert getattr(exc, "status_code", None) == 429
    else:
        raise AssertionError("Expected production quota enforcement")
