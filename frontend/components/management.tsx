import React, {useState, useEffect, ChangeEvent} from "react";
import { useNavigate } from "react-router-dom";

import { MandantenSelector } from "./mandantenselector";
import { MandantAuswahl } from "../types";

export function Management(){
    const [ mandanten, setMandanten ] = useState<string[]>()
    const [ years, setYears ] = useState<string[]>()
    const [ months, setMonths ] = useState<string[]>()
    const [ selectedMa, selectMandant ] = useState("");
    const [ selectedY, selectYear ] = useState("");
    const [ selectedMo, selectMonth ] = useState("");
    const [ exportMode, setExportMode ] = useState(false)
    const [ initDBMode, setInitDBMode ] = useState(false)
    const [ accountEditMode, setAccountEditMode ] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/management/ui/mandanten").then(rsp => {return rsp.json()}).then(json => {setMandanten(json)})
            if (selectedMa != "") {
                var m: MandantAuswahl = {mandant: selectedMa}
                fetch("/api/management/ui/year", {method: "POST", body: JSON.stringify(m), headers: {"Content-Type": "application/json"}}).then(rsp => {return rsp.json()}).then(json => {setYears(json)})
            }
            if (selectedY != "") {
                var m: MandantAuswahl = {mandant: selectedMa, year: selectedY}
                fetch("/api/management/ui/month", {method: "POST", body: JSON.stringify(m), headers: {"Content-Type": "application/json"}}).then(rsp => {return rsp.json()}).then(json => {setMonths(json)})
            }
        } catch (err) {
            console.log(err.message)
        }
    }, [selectedMa, selectedY])

    async function mandant(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectMandant(v)
    }
    async function year(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectYear(v)
    }
    async function month(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectMonth(v)
    }

    async function select(){
        if (selectedMa != "" && selectedY != "") {
            var m: MandantAuswahl = {
                mandant: selectedMa,
                year: selectedY,
                month: selectedMo
            }
            await fetch("/api/select/mandant", {
                method: "POST",
                body: JSON.stringify(m),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            navigate("/element/0")
        }
    }

    function unset_latest(){
        if (selectedMo != "") {
            selectMonth("")
            return;
        }
        if (selectedY != "") {
            selectYear("")
            return;
        }
        if (selectedMa != "") {
            selectMandant("")
            return;
        }
    }

    var selectorbox;
    if (exportMode) {
        selectorbox = <MandantenSelector purpose="Exportieren" endpoint="/api/management/export" download={true}/>
    }
    if (initDBMode) {
        selectorbox = <MandantenSelector purpose="Initialisieren" endpoint="/api/management/initdb"/>
    }
    if (accountEditMode) {
        selectorbox = <MandantenSelector purpose="Konten bearbeiten" endpoint="/api/management/editAccounts" redirect="/management/editAccounts"/>
    }

    var inner
    if (selectedMa == "") {
        inner = (
            <div>
                <p>Mandanten:</p>
                <ul className="list-disc pl-5">
                {mandanten?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={mandant}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }
    if (selectedMa != "" && selectedY == "") {
        inner = (
            <div>
                <p>Jahr:</p>
                <ul className="list-disc pl-5">
                {years?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={year}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }
    if (selectedMa != "" && selectedY != "" && selectedMo == "") {
        inner = (
            <div>
                <p>Monat:</p>
                <ul className="list-disc pl-5">
                {months?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={month}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }

    function exportBookings(){
        setExportMode(true);
        setInitDBMode(false);
        setAccountEditMode(false);
    }

    function initDB(){
        setInitDBMode(true);
        setExportMode(false);
        setAccountEditMode(false);
    }

    function editAccounts(){
        setAccountEditMode(true);
        setExportMode(false);
        setInitDBMode(false);
    }

    return (
        <div className="p-4 flex flex-row gap-4">
            <div>
                {inner}
                <div className="flex gap-3">
                    <button onClick={unset_latest}>Zurück</button>
                    <button onClick={select}>Öffnen</button>
                </div>
            </div>
            <div>
                <p>Aktionen:</p>
                <ul className="list-disc pl-5">
                    <li><a onClick={exportBookings}>Exportiere Aufteilungen</a></li>
                    <li><a onClick={initDB}>Initializiere Datenbank</a></li>
                    <li><a onClick={editAccounts}>Konten bearbeiten</a></li>
                </ul>
                {selectorbox}
            </div>
        </div>
    ) 
}