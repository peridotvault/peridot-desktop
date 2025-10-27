import { Principal } from "@dfinity/principal";

export function arrayStringToPrincipal({ arr }: { arr: Array<string> }): Array<Principal> {
    const arrPrincipal: Array<Principal> = [];
    for (let i = 0; i < arr.length; i++) {
        arrPrincipal.push(Principal.fromText(arr[i]));
    }
    return arrPrincipal;
}