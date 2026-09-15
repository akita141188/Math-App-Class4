# Local history data

At runtime the API creates:

`data/history/history.json`

This file is intentionally ignored by Git because it contains user learning history.
Copying the whole project folder (including ignored files) to another machine preserves
completed history.

The API writes the file atomically and keeps a `.corrupt-*.json` backup if the JSON
cannot be parsed.
