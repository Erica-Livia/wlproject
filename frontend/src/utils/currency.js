export const formatBIF = (amount) => {
    return new Intl.NumberFormat('bi-BI', {
        style: 'currency',
        currency: 'BIF',
        minimumFractionDigits: 0
    }).format(amount);
};

export const convertBIFtoUSD = (amount) => {
    return (amount / 2500).toFixed(2); // 1 USD = 2500 BIF
};