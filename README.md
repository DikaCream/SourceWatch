# SourceWatch

SourceWatch is a GenLayer app for tracking meaningful changes in public web documents.

A user registers a public HTTPS URL and describes what matters on that page. GenLayer validators fetch the document and commit an agreed baseline snapshot with a Keccak-256 hash. Later checks fetch the current version, compare its meaning with the baseline, and store a permanent report with a status, severity, summary, changed areas, citations, and the current snapshot.

The product is designed for pages that people rely on but cannot watch manually every day: pricing, API limits, security policies, eligibility rules, governance documents, and release notes.

## Why GenLayer is central

A normal contract can compare bytes. It cannot decide whether a changed paragraph affects a user while ignoring a date stamp or a navigation edit.

SourceWatch uses two explicit consensus rules:

- Baseline commitment uses exact hash equivalence. Validators must agree on the snapshot identity before a source becomes active.
- Change reports use semantic equivalence. Validators must agree on `UNCHANGED` or `MATERIAL`, the severity bucket, and the current snapshot hash. Their summaries and citations may use different wording.

The contract fails closed when a page cannot be fetched or a validator response cannot be parsed. A failed check remains pending and can be retried by the source owner after a cooldown.

## Contract

The Intelligent Contract is `contracts/source_watch.py`.

Core methods:

| Method | Purpose |
| --- | --- |
| `register_source(label, description, url)` | Fetch and commit a validator-agreed baseline |
| `check_source(source_id)` | Run a new semantic change check |
| `retry_check(report_id)` | Retry a failed check after the cooldown |
| `pause_source(source_id)` | Pause checks for an owned source |
| `resume_source(source_id)` | Resume an owned source |
| `get_source(source_id)` | Read source metadata and baseline identity |
| `get_report(report_id)` | Read a finalized change report |
| `list_sources(offset, limit)` | Browse registered sources |
| `list_source_reports(source_id, offset, limit)` | Browse a source's report history |

The public source view includes the URL because SourceWatch monitors public documents. The committed baseline bytes and each current snapshot are stored in the source/report records and exposed through their read methods for auditability.

## Project structure

```text
contracts/
  source_watch.py
frontend/
  src/
    pages/                 # monitor index, registration, detail, reports
    components/            # source cards, report rows, wallet controls
    lib/                   # GenLayer client and contract wrapper
tests/direct/
  conftest.py
  test_source_watch.py
```

## Local setup

Requirements:

- Python 3.12 or newer
- Node 18 or newer
- GenLayer tooling with `genvm-lint` and `gltest`
- An injected EVM wallet for frontend writes

Create a Python environment and install the contract tooling:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Run the contract quality gates:

```bash
genvm-lint check contracts/source_watch.py --json
gltest tests/direct/ -v
```

Run the frontend:

```bash
npm install
cp frontend/.env.example frontend/.env
npm run dev
```

Set `VITE_CONTRACT_ADDRESS` in `frontend/.env` after deployment. Reads can be tested without a connected wallet, while registration and checks require a wallet on GenLayer StudioNet.

## Deploy

Select a network and deploy the contract with the GenLayer CLI:

```bash
genlayer network set studionet
genlayer deploy --contract contracts/source_watch.py
```

Copy the resulting address into `frontend/.env` or the hosting provider's environment variables:

```text
VITE_CONTRACT_ADDRESS=0xYourSourceWatchContract
VITE_GENLAYER_NETWORK=studionet
VITE_GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

Then build the frontend:

```bash
npm run build
```

## Testing strategy

Direct tests mock web responses and LLM responses so state transitions are fast and deterministic. The suite covers:

- URL and field validation
- Exact baseline commitment
- Unavailable page failure handling
- Unchanged and material reports
- Severity and citation persistence
- Check cooldowns and retry behavior
- Source pause/resume access control
- Owner indexes and report pagination

Before a submission or deployment, run lint, direct tests, and an integration test against StudioNet when live validator behavior is part of the change.

## License

MIT. See [LICENSE](LICENSE).
