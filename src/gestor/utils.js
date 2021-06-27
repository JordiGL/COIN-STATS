export function sortOn(array, option, ascendent) {
    if(option == "Nom"){
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement.symbol.toLowerCase().localeCompare(secondElement.symbol.toLowerCase())
            );
        } else {
            array.sort((firstElement, secondElement) =>
                secondElement.symbol.toLowerCase().localeCompare(firstElement.symbol.toLowerCase())
            );
        }    
    } else if (option == "Last price") {
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement.lastPrice - secondElement.lastPrice
            );
        }else{
            array.sort((firstElement, secondElement) =>
                secondElement.lastPrice - firstElement.lastPrice
            );           
        }        
    } else if (option == "Price change percent") {
        if(ascendent){
            array.sort((firstElement, secondElement) =>
                firstElement.priceChangePercent - secondElement.priceChangePercent
            );
        }else{
            array.sort((firstElement, secondElement) =>
                secondElement.priceChangePercent - firstElement.priceChangePercent
            );           
        }        
    }     
    return array;
}