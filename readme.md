# Currently indevelopment and not usage ready
This App is meant to split zugferd invoices into the different accounts used in accounting
- UI written with react localized for german
- "backend" written in java with spring api
# Usage
with the nix flake use the "r" alias to run the backend
then connect on the same maschine with a web browser on localhost:8080
to use the ui. The API is configured to only accept local connections
# Get Dependencies for app
```bash
curl 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs' > ./src/main/resources/static/pdf.worker.min.mjs
```
# Where to put files
~/.config/erechnungssplitter.cfg.properties # settings

{config.basepath}/accounts.csv  # liste der accounts im format {accountnummer, "Account Name"}

{config.basepath}/personenkonto.csv  # liste der personenkonten im format {personen konto name, "Firmenname GmbH"}
