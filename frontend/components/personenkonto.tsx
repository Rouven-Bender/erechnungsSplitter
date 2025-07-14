import React, { useState, useEffect } from "react";

import { Account, PersonenkontoRsp } from "../types";
import { useParams } from "react-router-dom";

export default function Personenkonto({sender} : {sender : string | undefined}) {
    const { id } = useParams()
    let [ data, setData ] = useState<PersonenkontoRsp>()
    const [ addForm, setAddForm ] = useState(false)
    const [ errormsg, setErrorMsg ] = useState("")
    const [ render, setRender] = useState(0);

    useEffect(() => {
        try {
            fetch("/ui/personenkonto/"+id?.toString()).then(rsp => {return rsp.json()}).then(json => {setData(json)})
        } catch (err) {
            console.log(err.message)
        }
    }, [id])

    function addPersonenkonto(formdata : FormData) {
        let k = formdata.get("personenkonto")
        if (k == null || k.toString() == "") {
            setErrorMsg("Eingabe war leer")
            return;
        }
        if (!k.toString().match("[0-9*]")){
            setErrorMsg("Eingabe beinhaltete mehr wie Zahlen")
            return;
        }

        async function f(body, k) {
            await fetch("/add/personenkonto", {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (data != undefined) { // it should be defined when we get here
                data.personenkonto = k;
            }
            setRender(render+1)
        }
        if (sender != undefined){
            const a : Account = {
                name: sender,
                accountNumber: k.toString()
            }
            f(JSON.stringify(a), k)
        }

        if (errormsg.length != 0) {
            setErrorMsg("")
        }
    }

    if (data == undefined || data?.personenkonto || data?.personenkonto?.length == 0) {
        if (addForm) {
            return (
                <form action={addPersonenkonto}>
                    <label htmlFor="personenkonto">Personenkontonummer: </label>
                    <input className="border-1" name="personenkonto"></input> 
                    <button className="pl-3" type="submit">Hinzufügen</button>
                    {errormsg.length != 0 ? <p className="text-red-50">{errormsg}</p>: ""}
                </form>
            )
        }
        return (
            <div className="flex flex-row gap-4">
                <p>Kein Personenkonto für "{sender}" bekannt</p>
                <button className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center border-1 border-black"
                    onClick={() => {setAddForm(true)}}>
                  +
                </button>
            </div>
        )
    } 
    if (sender == undefined || sender.length == 0) {
        return (
            <p>Senderdaten nicht erkannt</p>
        )
    }
    if (data?.personenkonto == undefined) {
        return (
            <p>Personenkontodaten noch nicht angekommen</p>
        )
    }
    return (
        <p>Personenkonto: {data.personenkonto}</p>
    )
}