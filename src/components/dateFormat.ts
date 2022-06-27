function formatDate(year:number, month:number, day:number) {
    const date = new Date(year, month, day);
    return date.toLocaleDateString();
}

export {
    formatDate
}