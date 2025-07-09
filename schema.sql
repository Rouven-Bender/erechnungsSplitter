create table account (
    id integer primary key,
    accountnumber varchar(10),
    aname varchar(255)
);
create table personenkonto (
    id integer primary key,
    kontonumber varchar(10),
    aname varchar(255)
);
create table bookings (
    id integer primary key,
    betrag varchar(255),
    datum varchar(12),
    rechnungsnummer varchar(255),
    werundwas varchar(1024),
    personenkonto varchar(10),
    aufwandskonto varchar(10)
)