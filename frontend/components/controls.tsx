import React, { useState, useEffect } from "react";

type InvoiceData = {
    invoiceNumber: string;
    sellerVATID: string;
    invoiceTotal: string;
};
type ControlData = {
    numberOfPDFS: number;
    currentOfPDFS: number;
    invoice: InvoiceData | undefined;
};

export default function Controls(){
    const [data, setData] = useState<ControlData>()
    const [render, setRender] = useState(0)

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

    return(
        <div>
            <p>PDF: {data?.currentOfPDFS} / {data?.numberOfPDFS}</p>
            <form>
                <label className="pr-2" htmlFor="invoicetotal">Rechnungsbetrag:</label>
                <input name="invoicetotal" type="text" id="invoicetotal"
                    value={data?.invoice?.invoiceTotal}
                    disabled={data?.invoice?.invoiceTotal != "" ? true : false}
                ></input><br/>

                <label htmlFor="invoicenumber" className="pr-2">Rechnungsnummer:</label>
                <input name="invoicenumber" type="text" id="invoicenumber"
                    value={data?.invoice?.invoiceNumber}
                    disabled={data?.invoice?.invoiceNumber != "" ? true : false}
                ></input><br/>
            </form>
        </div>
    )
}