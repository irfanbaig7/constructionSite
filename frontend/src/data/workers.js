// Dummy data. Replaced by backend data later (only workerService changes).
const names = [
    "Ramesh Jadhav", "Suresh Pawar", "Mahesh Shinde", "Ganesh More", "Santosh Kale",
    "Vijay Gaikwad", "Anil Deshmukh", "Sunil Kadam", "Prakash Bhosale", "Dinesh Chavan",
    "Rajesh Patil", "Nitin Salunke", "Amol Thorat", "Sachin Wagh", "Kiran Mane",
    "Yogesh Nikam", "Rahul Sonawane", "Pravin Dhage", "Manoj Kharat", "Sandeep Bhoir",
    "Deepak Rathod", "Ajay Solanke", "Vikas Gawande", "Santosh Tambe", "Balu Jagtap",
    "Dattu Shirke", "Shankar Lokhande", "Mohan Bargal", "Ashok Waghmare", "Raju Ingale",
];

export const workers = names.map((name, i) => {
    const number = `9${800000000 + i * 1234567}`; // 10 digits
    return { id: `w${i + 1}`, name, phone: `+91 ${number.slice(0, 5)} ${number.slice(5)}` };
});