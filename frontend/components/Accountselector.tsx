import React, { useEffect, useState } from "react";
import { Account } from "../types";

export function Accountselector({className, position, searchterm, selected} : {className? : string | undefined, position : string, searchterm : string, selected?: string}) {
    const [accounts, setAccounts] = useState<Account[]>([])

    useEffect(() => {
        async function f() {
           try {
                var response = await fetch("/api/ui/accounts")
                setAccounts(await response.json());
           } catch (err) {
                console.log(err.message)
           }
        }
        f();
    }, [])

    return (
        <div className={"inline " + className}>
        <select name={position} className="border border-1" value={selected}>
            <option key={-1} value={""}>Bitte Auswählen</option>
            {accounts?.map((row : Account, idx : number) => {
                if (row.name.toLowerCase().includes(searchterm.toLowerCase()) || row.accountNumber.toLowerCase().includes(searchterm.toLowerCase())){
                    let s: boolean = (selected == row.accountNumber)
                    return (
                        <option key={idx} value={row.accountNumber}>{row.accountNumber} : {row.name}</option>
                    )
                }
            })}
        </select>
        </div>
    )
}