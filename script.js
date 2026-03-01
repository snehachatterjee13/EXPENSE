let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let income = parseFloat(localStorage.getItem("income")) || 0;
let chart;

/* Smooth Scroll */
function scrollToSection(id){
    document.getElementById(id).scrollIntoView({behavior:"smooth"});
}

/* Date Format */
function formatDate(date){
    let d = new Date(date);
    let day = d.getDate();
    let suffix = ["th","st","nd","rd"][(day%10>3)?0:((day%100-day%10!=10)?day%10:0)];
    return day+suffix+" "+d.toLocaleString('default',{month:'long'})+" "+d.getFullYear();
}

/* Set Income */
function setIncome(){
    income = parseFloat(document.getElementById("incomeInput").value)||0;
    localStorage.setItem("income",income);
    updateUI();
}

/* Add Transaction */
function addTransaction(){
    let amount = parseFloat(document.getElementById("amount").value);
    let type = document.getElementById("type").value;
    let category = document.getElementById("category").value;
    if(!amount) return;

    transactions.push({amount,type,category,date:new Date()});
    localStorage.setItem("transactions",JSON.stringify(transactions));
    updateUI();
}

/* Reset */
function resetAll(){
    localStorage.clear();
    transactions=[];
    income=0;
    updateUI();
}

/* Update UI */
function updateUI(){
    let totalExpense=0,totalCredit=0;

    transactions.forEach(t=>{
        if(t.type==="debit") totalExpense+=t.amount;
        else totalCredit+=t.amount;
    });

    let balance = income + totalCredit - totalExpense;

    document.getElementById("income").innerText="₹"+income;
    document.getElementById("expenses").innerText="₹"+totalExpense;
    document.getElementById("balance").innerText="₹"+balance;

    let table=document.getElementById("tableBody");
    table.innerHTML="";
    transactions.slice().reverse().forEach(t=>{
        table.innerHTML+=`
        <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.category}</td>
            <td class="${t.type}">${t.type}</td>
            <td class="${t.type}">₹${t.amount}</td>
        </tr>`;
    });

    if(income===0 && transactions.length===0){
        document.getElementById("expenseChart").style.display="none";
        document.getElementById("expenseEmpty").style.display="block";
        document.getElementById("balanceEmpty").style.display="block";
    }else{
        document.getElementById("expenseChart").style.display="block";
        document.getElementById("expenseEmpty").style.display="none";
        document.getElementById("balanceEmpty").style.display="none";
        createChart();
    }
}

/* Chart */
function createChart(){
    let categoryTotals={};
    transactions.forEach(t=>{
        if(t.type==="debit"){
            categoryTotals[t.category]=(categoryTotals[t.category]||0)+t.amount;
        }
    });

    if(chart) chart.destroy();

    chart=new Chart(document.getElementById("expenseChart"),{
        type:"doughnut",
        data:{
            labels:Object.keys(categoryTotals),
            datasets:[{
                data:Object.values(categoryTotals),
                backgroundColor:["#f59e0b","#ec4899","#6366f1","#10b981","#3b82f6"],
                borderWidth:0
            }]
        },
        options:{
            cutout:"70%",
            plugins:{legend:{position:"bottom"}}
        }
    });
}

updateUI();

