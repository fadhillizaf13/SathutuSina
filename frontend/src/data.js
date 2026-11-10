// Representative starter records. Demo/workspace values are stored in browser localStorage.
// Replace with production APIs and approved factory records before deployment.
const daysFromNow = (days) => {
  const date = new Date(); date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
export const roles = ["Admin", "Manager", "Staff"];
export const menuGroups = [
  { label: "OVERVIEW", items: ["Dashboard", "Notifications", "Reports"] },
  { label: "PEOPLE & HR", items: ["Employees", "Attendance", "Leave Requests", "Payroll", "Meal Preferences"] },
  { label: "FACTORY OPERATIONS", items: ["Production", "Products", "Raw Materials", "Cool Rooms", "Stock Transfers"] },
  { label: "SALES & LOGISTICS", items: ["Orders", "Deliveries", "Sales", "Payments", "Vehicles", "Outlets", "Returns & Wastage"] },
];
export const access = {
  Admin: menuGroups.flatMap(group => group.items),
  Manager: ["Dashboard", "Notifications", "Reports", "Employees", "Attendance", "Leave Requests", "Production", "Products", "Raw Materials", "Cool Rooms", "Stock Transfers", "Orders", "Deliveries", "Sales", "Vehicles", "Outlets", "Returns & Wastage", "Meal Preferences"],
  Staff: ["Dashboard", "Notifications", "Attendance", "Leave Requests", "Production", "Products", "Meal Preferences"],
};
const make = (key, columns, fields) => ({ key, columns, fields: fields || columns.filter(c => c !== "id") });
export const schema = Object.fromEntries([
  ["Employees", make("employees", ["id", "name", "department", "role", "phone", "status"])],
  ["Attendance", make("attendance", ["id", "employee", "date", "checkIn", "checkOut", "status"])],
  ["Leave Requests", make("leaves", ["id", "employee", "from", "to", "reason", "status"])],
  ["Payroll", make("payroll", ["id", "employee", "month", "basic", "overtime", "deductions", "status"])],
  ["Meal Preferences", make("meals", ["id", "employee", "date", "meal", "status"])],
  ["Production", make("batches", ["id", "product", "date", "quantity", "status"])],
  ["Products", make("products", ["id", "name", "category", "stock", "price", "expiry", "status"])],
  ["Raw Materials", make("materials", ["id", "name", "quantity", "min", "unit", "supplier", "status"])],
  ["Cool Rooms", make("rooms", ["id", "name", "capacity", "occupied", "temperature", "status"])],
  ["Stock Transfers", make("transfers", ["id", "product", "fromLocation", "toLocation", "quantity", "date", "status"])],
  ["Orders", make("orders", ["id", "customer", "product", "quantity", "date", "status"])],
  ["Deliveries", make("deliveries", ["id", "orderId", "vehicle", "driver", "date", "status"])],
  ["Sales", make("sales", ["id", "product", "quantity", "amount", "date", "status"])],
  ["Payments", make("payments", ["id", "customer", "amount", "date", "method", "status"])],
  ["Vehicles", make("vehicles", ["id", "number", "driver", "capacity", "status"])],
  ["Outlets", make("outlets", ["id", "name", "location", "stock", "status"])],
  ["Returns & Wastage", make("returns", ["id", "product", "quantity", "reason", "date", "status"])],
]);
export const choices = {
  Employees: { department: ["Production", "Quality Assurance", "Warehouse", "Logistics", "Administration", "Sales"], status: ["Active", "Inactive", "On Leave"] },
  Attendance: { status: ["Present", "Absent", "Late", "On Leave"] },
  "Leave Requests": { status: ["Pending", "Approved", "Rejected"] },
  Payroll: { status: ["Pending", "Paid"] },
  "Meal Preferences": { meal: ["Vegetarian", "Non-Vegetarian", "No Meal"], status: ["Confirmed", "Pending"] },
  Production: { status: ["Planned", "In Progress", "Completed", "On Hold"] },
  Products: { category: ["Ice Cream", "Yoghurt", "Milk", "Dessert"], status: ["Available", "Low Stock", "Out of Stock"] },
  "Raw Materials": { unit: ["kg", "L", "units", "packs"], status: ["Available", "Low Stock", "On Order"] },
  "Cool Rooms": { status: ["Active", "Maintenance", "Inactive"] },
  "Stock Transfers": { status: ["Pending", "In Transit", "Completed"] },
  Orders: { status: ["Pending", "In Progress", "Completed", "Cancelled"] },
  Deliveries: { status: ["Scheduled", "In Transit", "Delivered", "Delayed"] },
  Sales: { status: ["Completed", "Pending"] },
  Payments: { method: ["Cash", "Bank Transfer", "Cheque", "Card"], status: ["Pending", "Paid"] },
  Vehicles: { status: ["Available", "In Transit", "Maintenance"] },
  Outlets: { status: ["Active", "Inactive"] },
  "Returns & Wastage": { status: ["Pending", "Recorded", "Approved"] },
};
export const initialData = {
  employees: [
    { id:"EMP-001", name:"Nimal Perera", department:"Production", role:"Machine Operator", phone:"077 000 1001", status:"Active" },
    { id:"EMP-002", name:"Ayesha Fernando", department:"Quality Assurance", role:"Quality Officer", phone:"077 000 1002", status:"Active" },
    { id:"EMP-003", name:"Kasun Silva", department:"Warehouse", role:"Stock Supervisor", phone:"077 000 1003", status:"Active" },
    { id:"EMP-004", name:"Tharushi Jayasinghe", department:"Logistics", role:"Coordinator", phone:"077 000 1004", status:"Active" },
    { id:"EMP-005", name:"Ravi Kumar", department:"Administration", role:"Accounts Assistant", phone:"077 000 1005", status:"On Leave" },
  ],
  attendance: [{ id:"ATT-001", employee:"Nimal Perera", date:daysFromNow(0), checkIn:"08:02", checkOut:"17:00", status:"Present" }],
  leaves: [{ id:"LEV-001", employee:"Ravi Kumar", from:daysFromNow(0), to:daysFromNow(2), reason:"Personal", status:"Approved" }],
  payroll: [{ id:"PAY-001", employee:"Nimal Perera", month:daysFromNow(0).slice(0,7), basic:65000, overtime:9500, deductions:2100, status:"Pending" }],
  meals: [{ id:"MEA-001", employee:"Nimal Perera", date:daysFromNow(0), meal:"Vegetarian", status:"Confirmed" }],
  batches: [
    { id:"BAT-001", product:"Vanilla Ice Cream 1L", date:daysFromNow(-1), quantity:1200, status:"Completed" },
    { id:"BAT-002", product:"Chocolate Ice Cream 500ml", date:daysFromNow(0), quantity:900, status:"In Progress" },
    { id:"BAT-003", product:"Strawberry Yoghurt", date:daysFromNow(0), quantity:600, status:"Planned" },
  ],
  products: [
    { id:"PRD-001", name:"Vanilla Ice Cream 1L", category:"Ice Cream", stock:1800, price:1200, expiry:daysFromNow(90), status:"Available" },
    { id:"PRD-002", name:"Chocolate Ice Cream 500ml", category:"Ice Cream", stock:1250, price:700, expiry:daysFromNow(60), status:"Available" },
    { id:"PRD-003", name:"Strawberry Yoghurt", category:"Yoghurt", stock:450, price:380, expiry:daysFromNow(10), status:"Low Stock" },
    { id:"PRD-004", name:"Mango Ice Cream Cup", category:"Ice Cream", stock:670, price:240, expiry:daysFromNow(30), status:"Available" },
  ],
  materials: [
    { id:"RAW-001", name:"Fresh Milk", quantity:4800, min:2000, unit:"L", supplier:"Local Dairy Cooperative", status:"Available" },
    { id:"RAW-002", name:"Sugar", quantity:180, min:300, unit:"kg", supplier:"Lanka Sugar", status:"Low Stock" },
    { id:"RAW-003", name:"Cocoa", quantity:230, min:100, unit:"kg", supplier:"Ceylon Cocoa", status:"Available" },
  ],
  rooms: [
    { id:"CRM-001", name:"Cold Storage A", capacity:10000, occupied:7200, temperature:"-18°C", status:"Active" },
    { id:"CRM-002", name:"Cold Storage B", capacity:8000, occupied:4400, temperature:"-20°C", status:"Active" },
  ],
  transfers: [{ id:"TRF-001", product:"Vanilla Ice Cream 1L", fromLocation:"Cold Storage A", toLocation:"Outlet Colombo", quantity:150, date:daysFromNow(0), status:"Completed" }],
  orders: [
    { id:"ORD-001", customer:"City Supermarket", product:"Vanilla Ice Cream 1L", quantity:120, date:daysFromNow(0), status:"Pending" },
    { id:"ORD-002", customer:"Green Grocers", product:"Chocolate Ice Cream 500ml", quantity:90, date:daysFromNow(-1), status:"In Progress" },
    { id:"ORD-003", customer:"Happy Mart", product:"Strawberry Yoghurt", quantity:70, date:daysFromNow(-2), status:"Completed" },
  ],
  deliveries: [{ id:"DEL-001", orderId:"ORD-002", vehicle:"WP CA-1234", driver:"Dilan", date:daysFromNow(0), status:"In Transit" }],
  sales: [{ id:"SAL-001", product:"Vanilla Ice Cream 1L", quantity:120, amount:144000, date:daysFromNow(-2), status:"Completed" }],
  payments: [{ id:"PMT-001", customer:"City Supermarket", amount:144000, date:daysFromNow(-1), method:"Bank Transfer", status:"Pending" }],
  vehicles: [{ id:"VEH-001", number:"WP CA-1234", driver:"Dilan Perera", capacity:2000, status:"Available" }],
  outlets: [{ id:"OUT-001", name:"Colombo Outlet", location:"Colombo", stock:1600, status:"Active" }, {id:"OUT-002",name:"Galle Outlet", location:"Galle",stock:850,status:"Active"}],
  returns: [{id:"RET-001",product:"Strawberry Yoghurt",quantity:14,reason:"Damaged packaging",date:daysFromNow(-1),status:"Recorded"}],
  notifications: [
    { id:"NTF-001",title:"New production batch scheduled",date:daysFromNow(0),type:"info" },
    { id:"NTF-002",title:"Sugar stock below minimum level",date:daysFromNow(0),type:"warning" },
  ],
};
