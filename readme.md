> While mostly working adoption doesn't yet make sense since most invoices in accounting are pdf's without the zugferd data which this programm doesn't handle
so maybe 2028 when the deadline passes and the law (in germany) changes that. Until then Usability and or fitness is unknown but the potential is there

### Currently indevelopment and not usage ready
This App is meant to split zugferd invoices into the different accounts used in accounting
- UI written with react localized for german
- "backend" written in java with spring api
### TODO:
- Add auto selecting of account if the same item from the same seller was booked before
- Change the csv export table layout to the layout that datev can import
- Fix flake so the maven stuff doesn't spill in to home directory
### Usage
with the nix flake use the "r" alias to run the backend
then connect on the same maschine with a web browser on localhost:8080
to use the ui. The API is configured to only accept local connections
#### folder structure
```txt
base-folder
- mandant_a
    - year_x
        - month_y
            - *-invoice.pdf
            - db.sqlite
    - db.sqlite
```
#### Config
```properties
basepath=/home/kyu/src/erechnungsSplitter/testfolder/
```
### Get dependencies for app
```bash
curl 'https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs' > ./src/main/resources/static/pdf.worker.min.mjs
```
### Where to put files
~/.config/erechnungssplitter.cfg.properties # settings
