import React, { useEffect, useState } from "react";

import Personenkonto from "./personenkonto.tsx";
import { InvoicePager } from "./invoicepager.tsx";
import { InvoiceData } from "../types.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Accountselector } from "./Accountselector";
import { AccountedPosition } from "../types";

export function Booker() {
    const { id } = useParams()
    const [ bookFullInvoice, setBookFullInvoice ] = useState(true);
    const [ editMode, setEditMode ] = useState(false)
    const [ invoice, setInvoiceData ] = useState<InvoiceData>()
    const [ errormsg, setErrorMsg ] = useState("")
    const [ searchterm, setSearchTerm ] = useState("");
    const [ numberOfPDFS, setNumberofPDFs ] = useState(0);
    const [ accounteddata, setAccounteddata ] = useState<AccountedPosition[]>()

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/ui/" + id + "/invoicedata").then(rsp => {return rsp.json()}).then(json => {setInvoiceData(json)})
            fetch("/api/ui/numberofPDFs").then(response => {return response.text()}).then(text => {setNumberofPDFs(parseInt(text))})
            fetch("/api/ui/" + id +"/accounteddata").then(rsp => {return rsp.json()}).then(json => { setAccounteddata(json) })
        } catch (err) {
            console.log(err.message)
        }
    }, [id])

    var isBooked = (accounteddata != undefined && accounteddata[0] != undefined)
    var fullInvoiceBooked = (isBooked && accounteddata != undefined && accounteddata[0].listId == "0")
    var invoicedataExists = (invoice != undefined && invoice.datum != null)

    function book(formdata : FormData) {
        async function f(body) {
            if (id == undefined) {
                console.log("The PDF ID is undefined")
                return;
            }
            await fetch("/api/"+id+"/book", {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if ((parseInt(id) + 1) < numberOfPDFS) {
                navigate("/element/"+(parseInt(id)+1));
                setEditMode(false)
            }
        }
        var checked
        if (isBooked && !editMode) {
            if (fullInvoiceBooked) {
                checked = true
            } else {
                checked = false
            }
        } else {
            if (bookFullInvoice) {
                checked = true
            } else {
                checked = false
            }
        }
        if (checked) {
            let account = formdata.get("fullInvoice")
            if (account?.toString() == "" || account == undefined) {
                setErrorMsg("Kein Konto ausgewählt")
                return;
            }
            let t: AccountedPosition = { listId: "0", accountNumber: account?.toString() }
            f(JSON.stringify({
                accounts: Array(t)
            }))
        } else {
            const body: AccountedPosition[] = [];
            const i = formdata.entries();
            for (var row: IteratorResult<[string, FormDataEntryValue], any> = i.next();
                row.value != undefined; row = i.next()) {
                if (row.value[1] == "") {
                    setErrorMsg("Nicht alle Positionen haben ein Konto")
                    return
                }
                const e: AccountedPosition = {
                    listId: row.value[0],
                    accountNumber: row.value[1]
                }
                body.push(e)
            }
            f(JSON.stringify({
                accounts: body
            }))
        }
    }

    function inputintofilteraccounts(event) { setSearchTerm(event.target.value); }

    function toggleBookFullInvoice() {
        if (!editMode) {
            setEditMode(true);
        }
        setBookFullInvoice(!bookFullInvoice)
    }

    var fullinvoicebooker = (
            <div>
                <p>Konto für Rechnung: <br/></p>
                <Accountselector searchterm={searchterm} position={"fullInvoice"}
                    selected={accounteddata != undefined && accounteddata[0] && !editMode ? accounteddata[0].accountNumber : undefined} className="pr-3"/>
            </div>
    )

    var splitinvoice = (
        <div>
        <p>Konto für Rechnungspositionen: <br/></p>
        <table className="border-1 border-spacing-x-3 border-seperate">
            <thead>
            <tr>
                <th>Produktname</th>
                <th>Netto</th>
                <th>Anzahl</th>
                <th>Gesamt</th>
                <th>Konto</th>
            </tr>
            </thead>
            <tbody>
                { invoice?.positions?.map((row, idx)=> {
                    return (
                        <tr key={row.listId}>
                            <td>{row.productName}</td>
                            <td>{row.netto}</td>
                            <td>{row.quantity}</td>
                            <td>{row.total}</td>
                            <td><Accountselector searchterm={searchterm} position={row.listId}
                                selected={accounteddata != undefined && accounteddata[parseInt(row.listId)-1] && !editMode? accounteddata[parseInt(row.listId)-1]?.accountNumber : undefined}/></td>
                        </tr>
                    ) 
                })}
            </tbody>
        </table>
        </div>
    )

    var booker
    if (editMode && bookFullInvoice) {
        booker = fullinvoicebooker
    } else {
        booker = splitinvoice
    }
    if (isBooked && fullInvoiceBooked && !editMode) {
        booker = fullinvoicebooker
    }
    if (isBooked && !fullInvoiceBooked && !editMode) {
        booker = splitinvoice
    }
    if (!invoicedataExists && !isBooked && !editMode) {
        booker = fullinvoicebooker
    }
    if (!isBooked && bookFullInvoice && !editMode) {
        booker = fullinvoicebooker
    }
    if (!isBooked && !bookFullInvoice && !editMode) {
        booker = splitinvoice
    }

    var checked
    if (isBooked && !editMode) {
        if (fullInvoiceBooked) {
            checked = true
        } else {
            checked = false
        }
    } else {
        if (bookFullInvoice) {
            checked = true
        } else {
            checked = false
        }
    }

    return (
		<div className="h-full p-4">
            <div>
                <InvoicePager />
                <br/>
                <div className="bg-white inline-block">
                    <Personenkonto sender={invoice?.sender?.name}/>
                    {invoice == undefined ? <br /> : <div><label><input name="fullBookingToogle"
                        type="checkbox" checked={checked} onChange={toggleBookFullInvoice}></input> Volle Rechnung auf Konto</label><br /></div>}
                    <div className="pt-3"><input className="border-1" type="text" name="Kontofilter" placeholder="Filter" onChange={inputintofilteraccounts}/></div>
                    <form className="pt-3" action={book}>
                        {booker}
                        <button className="pt-4" type="submit">Buchen</button>
                    </form>
                    {errormsg ? <p className="pt-15">{errormsg}</p> : ""}
                </div>
            </div>
        </div>
    )
}