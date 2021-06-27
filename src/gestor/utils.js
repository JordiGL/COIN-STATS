const valorsColumnes = ["symbol",  "lastPrice", "priceChangePercent"];

export function sortOn(array, option, ascendent) {
    if(option == valorsColumnes[0]){
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement[valorsColumnes[0]].toLowerCase().localeCompare(secondElement[valorsColumnes[0]].toLowerCase())
            );
        } else {
            array.sort((firstElement, secondElement) =>
                secondElement[valorsColumnes[0]].toLowerCase().localeCompare(firstElement[valorsColumnes[0]].toLowerCase())
            );
        }    
    } else if (option == valorsColumnes[1]) {
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement[valorsColumnes[1]] - secondElement[valorsColumnes[1]]
            );
        }else{
            array.sort((firstElement, secondElement) =>
                secondElement[valorsColumnes[1]] - firstElement[valorsColumnes[1]]
            );           
        }        
    } else if (option == valorsColumnes[2]) {
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement[valorsColumnes[2]] - secondElement[valorsColumnes[2]]
            );
        }else{
            array.sort((firstElement, secondElement) =>
                secondElement[valorsColumnes[2]] - firstElement[valorsColumnes[2]]
            );           
        }        
    }     
    return array;
}