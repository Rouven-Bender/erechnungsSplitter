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
    const [ invoice, setInvoiceData ] = useState<InvoiceData>()
    const [ errormsg, setErrorMsg ] = useState("")
    const [searchterm, setSearchTerm] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/ui/invoicedata/" + id).then(rsp => {return rsp.json()}).then(json => {setInvoiceData(json)})
        } catch (err) {
            console.log(err.message)
        }
    }, [id])

    function book(formdata : FormData) {
        async function f(body) {
            if (id == undefined) {
                console.log("The PDF ID is undefined")
                return;
            }
            await fetch("/api/book/"+id.toString(), {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            navigate("/element/"+parseInt(id)+1);
        }
        if (bookFullInvoice) {
            let account = formdata.get("fullInvoice")
            if (account?.toString() == "" || account == undefined) { 
                setErrorMsg("Kein Konto ausgewählt")
                return;
            }
            let t: AccountedPosition = {listId: "0", accountNumber: account?.toString()}
            f(JSON.stringify({
                accounts: Array(t)
            }))
        } else {
            const body : AccountedPosition[] = [];
            const i = formdata.entries();
            for (var row : IteratorResult<[string, FormDataEntryValue], any> = i.next();
                row.value != undefined; row = i.next())
                {
                if (row.value[1] == "") {
                    setErrorMsg("Nicht alle Positionen haben ein Konto")
                    return
                }
                const e : AccountedPosition = {
                    listId:  row.value[0],
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
        setBookFullInvoice(!bookFullInvoice)
    }

    if (bookFullInvoice || invoice == undefined || invoice.datum == null) {
        var booker = ( 
            <div>
                <p>Konto für Rechnung: <br/></p>
                <Accountselector searchterm={searchterm} position={"fullInvoice"} className="pr-3"/>
            </div>
        )
    } else {
        var booker = (
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
                    {invoice?.positions?.map((row, idx)=> {
                        return (
                            <tr key={row.listId}>
                                <td>{row.productName}</td>
                                <td>{row.netto}</td>
                                <td>{row.quantity}</td>
                                <td>{row.total}</td>
                                <td><Accountselector searchterm={searchterm} position={row.listId}/></td>
                            </tr>
                        ) 
                    })}
                </tbody>
            </table>
            </div>
        )
    }

    return (
		<div className="h-full p-4">
            <div>
                <InvoicePager />
                <br/>
                {invoice ? "" : <p>Keine Zugferd Daten enthalten</p>}
                <Personenkonto sender={invoice?.sender?.name}/>
                <br />
                {invoice == undefined ? <br /> : <div><label><input name="fullBookingToogle"
                    type="checkbox" checked={bookFullInvoice} onChange={toggleBookFullInvoice}></input> Volle Rechnung auf Konto</label><br /></div>}
                <input type="text" name="Kontofilter" placeholder="Filter" onChange={inputintofilteraccounts}/>
                <form action={book}>
                    {booker}
                    <button type="submit">Buchen</button>
                </form>
                {errormsg ? <p className="pt-15">{errormsg}</p> : ""}
            </div>
        </div>
    )
}