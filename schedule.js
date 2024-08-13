function isSaturday(date) {
    const day = date.getDay();
    return day === 6;
}

function isFriday(date) {
    const day = date.getDay();
    return day === 5;
}

function handleStartDateChange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startDate = new Date(startDateInput.value);

    if (!isSaturday(startDate)) {
        alert('Please select a Saturday as the start date.');
        startDateInput.value = ''; // Clear the input
        endDateInput.disabled = true;
        return;
    }

    // Enable the end date input and restrict its options
    endDateInput.disabled = false;
    endDateInput.value = ''; // Clear any previously selected end date
    endDateInput.setAttribute('min', startDateInput.value);
}

function handleEndDateChange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (!isFriday(endDate)) {
        alert('Please select a Friday as the end date.');
        endDateInput.value = ''; // Clear the input
        return;
    }

    if (endDate < startDate) {
        alert('The end date cannot be before the start date.');
        endDateInput.value = ''; // Clear the input
        return;
    }
}

// Set the print header details
function setPrintHeader() {
    const branchSelect = document.getElementById('branchSelect');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const branchLine = document.getElementById('branchLine');
    const dateRangeLine = document.getElementById('dateRangeLine');

    branchLine.innerHTML = `<strong>Branch:</strong> ${branchSelect.options[branchSelect.selectedIndex].text}`;
    dateRangeLine.innerHTML = `<strong>Date Range:</strong> ${startDateInput.value} to ${endDateInput.value}`;
}



// Initialize the min date for startDate when the page loads

// Function to update Senior Barista options based on Supervisor's selection
function updateSeniorBaristaOptions(group) {
    const supervisorSelect = document.getElementById(`offSupervisor${group}`);
    const seniorBaristaSelect = document.getElementById(`offSeniorBarista${group}`);
    const selectedDay = supervisorSelect.value;

    // Remove all options from the Senior Barista select
    while (seniorBaristaSelect.options.length > 0) { 
        seniorBaristaSelect.remove(0); 
    }

    // Repopulate Senior Barista select with all days except the selected day
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
        if (day !== selectedDay) {
            const option = document.createElement('option');
            option.value = day;
            option.text = day;
            seniorBaristaSelect.add(option);
        }
    });
}

function updateAllOptions() {
    updateSeniorBaristaOptions('A');
    updateSeniorBaristaOptions('B');
}

// Define the employees and their respective shifts, including two jokers
const employees = [
    { position: 'SUPERVISOR', name: 'SUPERVISOR A', shift: 'A' },
    { position: 'SENIOR BARISTA', name: 'SENIOR BARISTA A', shift: 'A' },
    { position: 'BARISTA', name: 'BARISTA A', shift: 'A' },
    { position: 'CASHIER', name: 'CASHIER A', shift: 'A' },
    { position: 'Mid-shift-joker', name: 'Joker 1', shift: 'JOKER1', dayOff: 'Friday' }, // Joker 1 always off on Friday
    { position: 'Mid-shift-joker', name: 'Joker 2', shift: 'JOKER2' },
    { position: 'SUPERVISOR', name: 'SUPERVISOR B', shift: 'B' },
    { position: 'SENIOR BARISTA', name: 'SENIOR BARISTA B', shift: 'B' },
    { position: 'BARISTA', name: 'BARISTA B', shift: 'B' },
    { position: 'CASHIER', name: 'CASHIER B', shift: 'B' }
];
// Function to reset employees' day off assignments
// Function to reset employees' day off assignments
function resetDayOffs() {
    employees.forEach(employee => {
        employee.dayOff = null;
    });
}

// Function to assign a random day off while ensuring no more than 2 employees are off per day
function assignDayOff(shift, excludeDays = [], existingOffDays = {}) {
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const shiftDaysOff = employees
        .filter(emp => emp.shift === shift && emp.dayOff)
        .map(emp => emp.dayOff)
        .concat(excludeDays);

    let dayOff;
    do {
        dayOff = days[Math.floor(Math.random() * days.length)];
    } while (shiftDaysOff.includes(dayOff) || (existingOffDays[dayOff] && existingOffDays[dayOff] >= 2));

    // Ensure the day off does not exceed the maximum
    if (!existingOffDays[dayOff]) {
        existingOffDays[dayOff] = 0;
    }
    existingOffDays[dayOff]++;

    return dayOff;
}

// Function to ensure minimum employees in shifts A and B
function ensureMinimumEmployees(existingOffDays) {
    const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    days.forEach(day => {
        let offCount = existingOffDays[day] || 0;
        if (offCount < 1) {
            // Find an employee who doesn't have a day off and assign them this day
            for (let employee of employees) {
                if (!employee.dayOff) {
                    employee.dayOff = day;
                    existingOffDays[day] = (existingOffDays[day] || 0) + 1;
                    break;
                }
            }
        }
    });
}

// Function to ensure every employee gets exactly one day off per week
function ensureWeeklyOff(existingOffDays) {
    employees.forEach(employee => {
        if (!employee.dayOff) {
            // Assign the employee a random day off, ensuring it's not a duplicate
            employee.dayOff = assignDayOff(employee.shift, [], existingOffDays);
        }
    });
}

// Function to validate that all employees, including Joker 2, have a weekly off
function validateWeeklyOff() {
    return employees.every(employee => employee.dayOff !== null);
}

// Function to generate the schedule
function generateSchedule() {
    let isValidSchedule = false;

    while (!isValidSchedule) {
        resetDayOffs();  // Reset day off assignments before generating a new schedule
        let existingOffDays = {}; // Initialize with no off days

        // Get the user-assigned off days
        const offSupervisorA = document.getElementById('offSupervisorA').value;
        const offSeniorBaristaA = document.getElementById('offSeniorBaristaA').value;
        const offSupervisorB = document.getElementById('offSupervisorB').value;
        const offSeniorBaristaB = document.getElementById('offSeniorBaristaB').value;

        // Assign the off days for the specified roles
        employees.forEach(employee => {
            if (employee.position === 'SUPERVISOR' && employee.shift === 'A') {
                employee.dayOff = offSupervisorA;
                existingOffDays[offSupervisorA] = (existingOffDays[offSupervisorA] || 0) + 1;
            } else if (employee.position === 'SENIOR BARISTA' && employee.shift === 'A') {
                employee.dayOff = offSeniorBaristaA;
                existingOffDays[offSeniorBaristaA] = (existingOffDays[offSeniorBaristaA] || 0) + 1;
            } else if (employee.position === 'SUPERVISOR' && employee.shift === 'B') {
                employee.dayOff = offSupervisorB;
                existingOffDays[offSupervisorB] = (existingOffDays[offSupervisorB] || 0) + 1;
            } else if (employee.position === 'SENIOR BARISTA' && employee.shift === 'B') {
                employee.dayOff = offSeniorBaristaB;
                existingOffDays[offSeniorBaristaB] = (existingOffDays[offSeniorBaristaB] || 0) + 1;
            }
        });

        // Assign random off days for Joker 1 dynamically, ensuring no more than 2 off per day
        employees.forEach(employee => {
            if (employee.position === 'Mid-shift-joker' && employee.shift === 'JOKER1') {
                employee.dayOff = assignDayOff(employee.shift, [], existingOffDays);
            }
        });

        // Assign random off days for the other employees while respecting the restrictions
        employees.forEach(employee => {
            if (!employee.dayOff) {
                employee.dayOff = assignDayOff(employee.shift, [], existingOffDays);
            }
        });

        // Ensure every employee has exactly one day off per week
        ensureWeeklyOff(existingOffDays);
        setPrintHeader();

        // Ensure minimum employees get a day off per day
        ensureMinimumEmployees(existingOffDays);

        // Validate that all employees, including Joker 2, have a weekly off
        isValidSchedule = validateWeeklyOff();
    }

    let days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let table = document.getElementById('scheduleTable');
    table.innerHTML = ''; // Clear previous table

    // Add header row
    let headerRow = '<tr><th>Position</th><th>Name</th>';
    days.forEach(day => {
        headerRow += `<th>${day}</th>`;
    });
    headerRow += '</tr>';
    table.innerHTML = headerRow;

    // Generate and display the schedule
    employees.forEach((employee, index) => {
        let rowHTML = '<tr>';
        rowHTML += `<td>${employee.position}</td>`;
        rowHTML += `<td><input type="text" value="${employee.name}" oninput="updateEmployeeName(${index}, this.value)" /></td>`;
        
        let schedule = [];
        if (employee.shift === 'JOKER1' || employee.shift === 'JOKER2') {
            // Track if the joker has already taken a day off
            let joker1DayOffTaken = employee.shift === 'JOKER1' ? true : false;
            let joker2DayOffTaken = employee.shift === 'JOKER2' && employee.dayOff === 'Friday' ? true : false;
            let jokerShift1 = '';
            let jokerShift2 = '';
        
            // Mid-shift-jokers' dynamic schedule per day
            days.forEach(day => {
                let shiftACount = employees.filter(emp => emp.shift === 'A' && emp.dayOff !== day).length;
                let shiftBCount = employees.filter(emp => emp.shift === 'B' && emp.dayOff !== day).length;
        
                if (shiftACount < 3 || shiftBCount < 3) {
                    alert("Unacceptable shift allocation. Please regenerate the schedule.");
                    return; // Stop the current schedule generation
                }
        
                // Apply the logic for assigning joker shifts based on the shift counts

                if (shiftACount >= 3 && shiftBCount === 3) {
                    jokerShift1 = '11AM - 8PM';
                    jokerShift2 = '2PM - 11PM';
                } else if (shiftACount === 3 && shiftBCount > 3) {
                    jokerShift1 = '11AM - 8PM';
                    jokerShift2 = '11AM - 8PM';
                } else if (shiftACount === 4 && shiftBCount === 4) {
                    if (!joker2DayOffTaken) {
                        jokerShift1 = '11AM - 8PM';
                        jokerShift2 = 'OFF';
                        joker2DayOffTaken = true;
                    
                    } else if (!joker1DayOffTaken) {
                        jokerShift1 = 'OFF';
                        jokerShift2 = '11AM - 8PM';
                        joker1DayOffTaken = true;
                    } 
                }else {
                    jokerShift1 = '11AM - 8PM';
                    jokerShift2 = '12AM - 9PM';
                }
        
                // Push the shift for each joker based on their role
                if (employee.shift === 'JOKER1') {
                    schedule.push(employee.dayOff === day ? 'OFF' : jokerShift1);
                } else if (employee.shift === 'JOKER2') {
                    schedule.push(jokerShift2);
                }
            });
        } else {
            // Assign 'A', 'B', or 'OFF' based on their shift assignment and day off
            days.forEach(day => {
                let shift = employee.shift;
                schedule.push(employee.dayOff === day ? 'OFF' : shift);
            });
        }
        
        rowHTML += schedule.map(day => `<td class="${day === 'OFF' ? 'off' : ''}">${day}</td>`).join('');
        table.innerHTML += rowHTML;
    });
}

// Function to update the employee name
function updateEmployeeName(index, newName) {
    employees[index].name = newName;
}

// Initial generation of schedule
generateSchedule();
