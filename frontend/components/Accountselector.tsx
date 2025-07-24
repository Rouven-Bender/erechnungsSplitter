import React, { ChangeEvent, useEffect, useState } from "react";
import { Account, AccountedPosition } from "../types";
import { useParams } from "react-router-dom";

export function Accountselector({className, position, searchterm, idx} : {className? : string | undefined, position : string, searchterm : string, idx: number}) {
    const {id} = useParams();
    const [accounts, setAccounts] = useState<Account[]>([])
    const [ s, setSelected ] = useState("")
    
    useEffect(() => {
        async function f() {
           try {
                var response = await fetch("/api/ui/accounts")
                setAccounts(await response.json());
                response = await fetch("/api/ui/" + id +"/accounteddata")
                var accd:AccountedPosition[] = await response.json()
                if (accd != undefined) {
                    if (accd.length != 0) {
                        setSelected(accd[idx].accountNumber);
                    } else {
                        setSelected("")
                    }
                } else {
                    setSelected("")
                }
           } catch (err) {
                console.log(err.message)
           }
        }
        f();
    }, [id])

    const handleChange = event => {
        setSelected(event.target.value)
    }

    var selector = (
        <select name={position} className="border border-1" value={s} onChange={handleChange}>
            <option key={-1} value={""}>Bitte Auswählen</option>
            {accounts?.map((row : Account, idx : number) => {
                if (row.name.toLowerCase().includes(searchterm.toLowerCase()) || row.accountNumber.toLowerCase().includes(searchterm.toLowerCase())){
                    return (
                        <option key={idx} value={row.accountNumber}>{row.accountNumber} : {row.name}</option>
                    )
                }
            })}
        </select>
    )
    return (
        <div className={className ? "inline " + className : "inline"}>
            {selector}
        </div>
    )
}