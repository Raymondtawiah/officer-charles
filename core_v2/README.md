# Officer Charles Core V2

Focused Python backend for the Laravel/Inertia Officer Charles app.

## Run

```bash
python3 -m venv .venv-core-v2
.venv-core-v2/bin/pip install -r core_v2/requirements.txt
.venv-core-v2/bin/python -m core_v2.server
```

By default, `core_v2` loads `OPENAI_KEY` from `core/project/.env`, then from the root `.env`.

On Debian/Ubuntu, install `python3-venv` first if virtual environment creation fails.

Default URLs:

- HTTP: `http://127.0.0.1:8010`
- WebSocket: `ws://127.0.0.1:8010/ws/{session_id}`

Laravel should use:

```env
CORE_V2_BASE_URL=http://127.0.0.1:8010
CORE_V2_WS_PUBLIC_URL=ws://127.0.0.1:8010
```
