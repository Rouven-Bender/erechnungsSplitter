import React, {useState, useEffect} from "react";
import {createRoot} from 'react-dom/client';

//import FileTree from "./components/filetree";
import { PDFDisplay } from "./components/PDFDisplay";
import Personenkonto from "./components/personenkonto";

import { Account, ControlData, AccountedPosition } from "./types";

function Application(){
    const [data, setData] = useState<ControlData>()
    const [bookFullInvoice, setBookFullInvoice] = useState(true);
    const [render, setRender] = useState(0)
    const [searchterm, setSearchTerm] = useState("");

    useEffect(() => {
        async function f() {
           try {
                var response = await fetch('/ui') //TODO: I am basicly doing toplevel app state here which I shouldn't
                setData(await response.json())
           } catch(err) {
                console.log(err.message)
           }
        }
        f();
    }, [render])

    function toggleBookFullInvoice() {
        setBookFullInvoice(!bookFullInvoice)
    }

    function book(formdata : FormData) {
        async function f(body) {
            await fetch("/book", {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            setRender(render+1)
        }
        if (bookFullInvoice) {
            let account = formdata.get("fullInvoice")
            if (account?.toString() == "" || account == undefined) { 
                if (data != undefined){
                    const temp: ControlData = {
                        numberOfPDFS: data.numberOfPDFS,
                        currentOfPDFS: data.currentOfPDFS,
                        msg: "Kein Konto ausgewählt",
                        invoice: data.invoice,
                        accounts: data.accounts,
                        personenkonto: data.personenkonto
                    }
                    setData(temp)
                }
                return;
            }
            f(JSON.stringify({
                fullInvoice: account?.toString()
            }))
        } else {
            const body : AccountedPosition[] = [];
            const i = formdata.entries();
            for (var row : IteratorResult<[string, FormDataEntryValue], any> = i.next();
                row.value != undefined; row = i.next())
                {
                if (row.value[1] == "") {
                    if (data != undefined){
                        const temp: ControlData = {
                            numberOfPDFS: data.numberOfPDFS,
                            currentOfPDFS: data.currentOfPDFS,
                            msg: "Nicht alle Positionen haben ein Konto",
                            invoice: data.invoice,
                            accounts: data.accounts,
                            personenkonto: data.personenkonto
                        } 
                        setData(temp)
                    }
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

    if (bookFullInvoice || data?.invoice == undefined) {
        var booker = ( 
            <div>
                <p>Konto für Rechnung: <br/></p>
                <Accountselector position={"fullInvoice"} className="pr-3"/>
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
                    {data?.invoice?.positions.map((row, idx)=> {
                        return (
                            <tr key={row.listId}>
                                <td>{row.productName}</td>
                                <td>{row.netto}</td>
                                <td>{row.quantity}</td>
                                <td>{row.total}</td>
                                <td><Accountselector position={row.listId}/></td>
                            </tr>
                        ) 
                    })}
                </tbody>
            </table>
            </div>
        )
    }

    function Accountselector({className, position} : {className? : string | undefined, position : string}) {
        return (
            <div className={"inline " + className}>
            <select name={position} className="border border-1">
                <option key={-1} value={""}>Bitte Auswählen</option>
                {data?.accounts?.map((row : Account, idx : number) => {
                   if (row.name.toLowerCase().includes(searchterm) || row.accountNumber.toLowerCase().includes(searchterm)){
                       return (
                            <option key={idx} value={row.accountNumber}>{row.accountNumber} : {row.name}</option>
                       ) 
                   }
                })}
            </select>
            </div>
        )
    }

    function inputintofilteraccounts(event) { setSearchTerm(event.target.value); }

	return (
		<div className="grid grid-cols-[max-content_1fr] min-h-screen">
            <PDFDisplay invoice={data?.invoice} pdfnumber={data?.currentOfPDFS}/>
			<div className="h-full p-4">
                <div>
                    <p>PDF: {data?.currentOfPDFS} / {data?.numberOfPDFS}</p>
                    <br/>
                    {data?.invoice ? "" : <p>Keine Zugferd Daten enthalten</p>}
                    <Personenkonto sender={data?.invoice?.sender.name}/>
                    <br />
                    {data?.invoice == undefined ? <br /> : <div><label><input name="fullBookingToogle"
                        type="checkbox" checked={bookFullInvoice} onChange={toggleBookFullInvoice}></input> Volle Rechnung auf Konto</label><br /></div>}
                    <input type="text" name="Kontofilter" placeholder="Filter" onChange={inputintofilteraccounts}/>
                    <form action={book}>
                        {booker}
                        <button type="submit">Buchen</button>
                    </form>
                    {data?.msg ? <p className="pt-15">{data.msg}</p> : ""}
                </div>
            </div>
		</div>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)