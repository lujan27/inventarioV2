var date = new Date('2022-07-20T19:47:20.359Z');
const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const formatDate = (date) => {
    let formatted_date = date.getDate() + "-" + months[date.getMonth()] + "-" + date.getFullYear()
    return formatted_date + ' ' + date.toLocaleTimeString('en-US');
}

console.log(formatDate(date))