import pytest

from app.services.model_budget import get_model_budget


@pytest.fixture(autouse=True)
def fresh_model_budget():
    """Each test starts with an unspent model-call budget."""
    get_model_budget.cache_clear()
    yield
    get_model_budget.cache_clear()
