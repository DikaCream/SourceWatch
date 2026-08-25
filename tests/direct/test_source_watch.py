"""Direct tests for SourceWatch state transitions and consensus boundaries."""

from tests.direct.conftest import (
    BASELINE,
    GOOD_DESCRIPTION,
    GOOD_URL,
    addr,
    mock_baseline,
    mock_check,
    register_active,
    set_time,
    to_hex,
)


def test_register_commits_baseline(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    source = contract.get_source(sid)
    assert source["status"] == "ACTIVE"
    assert source["label"] == "API docs"
    assert source["owner"].lower() == to_hex(direct_alice).lower()
    assert source["baseline_hash"]
    assert source["check_count"] == 0


def test_register_validates_inputs(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("label must be"):
        contract.register_source("ab", GOOD_DESCRIPTION, GOOD_URL)
    with direct_vm.expect_revert("description must be"):
        contract.register_source("Docs", "too short", GOOD_URL)
    with direct_vm.expect_revert("public https URL"):
        contract.register_source("Docs", GOOD_DESCRIPTION, "http://example.com/docs")


def test_registration_fails_when_page_unavailable(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    direct_vm.sender = direct_alice
    direct_vm.mock_web(r".*example\.com.*", {"status": 404, "body": ""})
    with direct_vm.expect_revert("could not commit a readable baseline"):
        contract.register_source("Docs", GOOD_DESCRIPTION, GOOD_URL)


def test_check_unchanged_stores_report(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    set_time("2030-01-01T00:10:00Z")
    direct_vm.sender = direct_alice
    mock_check(direct_vm, BASELINE)
    rid = int(contract.check_source(sid))
    report = contract.get_report(rid)
    source = contract.get_source(sid)
    assert report["status"] == "UNCHANGED"
    assert report["severity"] == 0
    assert report["snapshot"] == BASELINE
    assert source["last_report_id"] == rid
    assert source["check_count"] == 1


def test_check_material_change_stores_reason_and_citation(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    changed = "Pricing: 40 GEN per month. API limit: 20 requests per day."
    set_time("2030-01-01T00:10:00Z")
    direct_vm.sender = direct_alice
    mock_check(
        direct_vm,
        changed,
        status="MATERIAL",
        severity=8,
        summary="The price and daily API allowance changed materially.",
        areas="pricing, API limits",
        citations="Pricing: 40 GEN per month; API limit: 20 requests per day.",
    )
    rid = int(contract.check_source(sid))
    report = contract.get_report(rid)
    assert report["status"] == "MATERIAL"
    assert report["severity"] == 8
    assert "pricing" in report["changed_areas"]
    assert "40 GEN" in report["citations"]
    assert contract.get_source(sid)["material_count"] == 1


def test_check_is_throttled(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_alice
    mock_check(direct_vm, BASELINE)
    contract.check_source(sid)
    with direct_vm.expect_revert("checked recently"):
        contract.check_source(sid)


def test_owner_controls_pause_and_retry(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("only the source owner can pause"):
        contract.pause_source(sid)
    direct_vm.sender = direct_alice
    contract.pause_source(sid)
    with direct_vm.expect_revert("source is paused"):
        contract.check_source(sid)
    contract.resume_source(sid)
    assert contract.get_source(sid)["status"] == "ACTIVE"


def test_failed_check_can_retry_after_cooldown(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    sid = register_active(contract, direct_vm, direct_alice)
    direct_vm.sender = direct_alice
    direct_vm.mock_web(r".*example\.com.*", {"status": 200, "body": BASELINE})
    direct_vm.mock_llm(r".*web-change analyst.*", "not json")
    rid = int(contract.check_source(sid))
    assert contract.get_report(rid)["status"] == "PENDING"
    with direct_vm.expect_revert("check was attempted recently"):
        contract.retry_check(rid)
    set_time("2030-01-01T00:10:00Z")
    direct_vm.clear_mocks()
    direct_vm.sender = direct_alice
    mock_check(direct_vm, BASELINE)
    contract.retry_check(rid)
    assert contract.get_report(rid)["status"] == "UNCHANGED"


def test_lists_and_missing_views(direct_vm, direct_deploy, direct_alice):
    contract = direct_deploy("contracts/source_watch.py")
    first = register_active(contract, direct_vm, direct_alice, "First docs")
    set_time("2030-01-01T00:01:00Z")
    second = register_active(contract, direct_vm, direct_alice, "Second docs")
    assert contract.get_config()["source_count"] == 2
    assert [x["id"] for x in contract.list_sources(0, 10)] == [first, second]
    assert [x["id"] for x in contract.list_owner_sources(addr(direct_alice), 0, 10)] == [first, second]
    assert contract.get_source(999) is None
    assert contract.get_report(999) is None
    assert contract.list_source_reports(first, 0, 10) == []
