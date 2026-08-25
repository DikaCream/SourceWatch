"""Shared SourceWatch direct-test helpers."""

import json
import sys

import pytest

BASE_ISO = "2030-01-01T00:00:00Z"
GOOD_URL = "https://example.com/docs"
GOOD_DESCRIPTION = "Monitor this public document and detect changes that could affect users."
BASELINE = "Pricing: 10 GEN per month. API limit: 100 requests per day."


def set_time(value: str) -> None:
    gl = sys.modules.get("genlayer.gl")
    if gl is not None:
        gl.message_raw["datetime"] = value


def addr(value):
    from genlayer.py.types import Address
    return value if isinstance(value, Address) else Address(value)


def to_hex(value):
    if hasattr(value, "as_hex"):
        return value.as_hex
    from genlayer.py.types import Address
    return Address(value).as_hex


@pytest.fixture(autouse=True)
def reset_time():
    set_time(BASE_ISO)
    yield
    set_time(BASE_ISO)


def mock_baseline(vm, body=BASELINE):
    vm.mock_web(r".*example\.com.*", {"status": 200, "body": body})


def mock_check(
    vm,
    body,
    status="UNCHANGED",
    severity=0,
    summary="No material change.",
    areas="",
    citations="Current text matches the baseline.",
):
    vm.mock_web(r".*example\.com.*", {"status": 200, "body": body})
    vm.mock_llm(
        r".*web-change analyst.*",
        json.dumps(
            {
                "status": status,
                "severity": severity,
                "summary": summary,
                "changed_areas": areas,
                "citations": citations,
                "snapshot": "ignored-by-leader",
                "current_snapshot": body,
            }
        ),
    )


def register_active(contract, vm, owner, label="API docs"):
    vm.sender = owner
    mock_baseline(vm)
    source_id = int(contract.register_source(label, GOOD_DESCRIPTION, GOOD_URL))
    vm.clear_mocks()
    return source_id
