import React, {useState, useEffect} from "react";
import {createRoot} from 'react-dom/client';

//import FileTree from "./components/filetree";
import { PDFDisplay } from "./components/PDFDisplay";

import { Account, ControlData } from "./types";

function Application(){
    const [data, setData] = useState<ControlData>()
    const [bookFullInvoice, setBookFullInvoice] = useState(true);
    const [render, setRender] = useState(0)
    const [searchterm, setSearchTerm] = useState("");

    useEffect(() => {
        async function f() {
           try {
                var response = await fetch('/ui')
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

    function book(formdata) {
        async function f(account) {
            await fetch("/book", {
                method: "POST",
                body: JSON.stringify({
                    account: account
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            setRender(render+1)
        }
        let account = formdata.get("account")
        f(account)
    }

    if (bookFullInvoice) {
        var booker = (
            <form action={book}>
                <label htmlFor="account">Konto für Rechnung: <br/></label>
                <select name="account" id="account" className="border border-1">
                    <option key={-1} value={"----"}>Bitte Auswählen</option>
                    {data?.accounts?.map((row : Account, idx : number) => {
                       if (row.name.toLowerCase().includes(searchterm) || row.accountNumber.toLowerCase().includes(searchterm)){
                           return (
                                <option key={idx} value={row.accountNumber}>{row.accountNumber} : {row.name}</option>
                           ) 
                       }
                    })}
                </select>
                <br/>
                <button type="submit">Buchen</button>
            </form>
        )
    } else {
        var booker = (
            <div><p>Invoice splitting</p></div>
        )
    }

    function inputintofilteraccounts(event) { setSearchTerm(event.target.value); }

	return (
		<div className="grid grid-cols-[max-content_1fr] min-h-screen">
            <PDFDisplay invoice={data?.invoice}/>
			<div className="h-full bg-green-200 p-4">
                <div>
                    <p>PDF: {data?.currentOfPDFS} / {data?.numberOfPDFS}</p>
                    <label><input name="fullBookingToogle"
                        type="checkbox" checked={bookFullInvoice} onChange={toggleBookFullInvoice}></input> Volle Rechnung auf Konto</label><br />
                    <input type="text" placeholder="Filter" onChange={inputintofilteraccounts}/>
                    {booker}
                    {data?.msg ? <p>{data.msg}</p> : ""}
                </div>
            </div>
		</div>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)