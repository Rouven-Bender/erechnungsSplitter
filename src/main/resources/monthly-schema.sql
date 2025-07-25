create table bookings (
    id integer primary key,
    betrag varchar(255),
    datum varchar(12),
    rechnungsnummer varchar(255),
    werundwas varchar(1024),
    personenkonto varchar(10),
    aufwandskonto varchar(10)
);
create index idx_bookings_rechnungsnummer on bookings(rechnungsnummer);
create index idx_bookings_personenkonto on bookings(personenkonto)