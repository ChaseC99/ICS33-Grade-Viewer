var grades_json;

// Sends xmlh request
function sendrequest(func){
    // THIS CODE LOGS THE JSON OBJECT TO THE CONSOLE
    // Sets xlsm file source as the test file in our GitHub repo
    var url = "https://raw.githubusercontent.com/ChaseC99/ICS33-Grade-Viewer/master/gradesTestFile.xlsm";

    /* set up async GET request */
    var req = new XMLHttpRequest();
    req.open("GET", url, true);


    // Tell request what to do with code once the request loads
    req.onload = function(e) {
        grades_json = xlsm_to_json(req);
        console.log(grades_json);   // Debugging code
        func(grades_json)
    }

    // Send request
    req.send();
    req.responseType = "arraybuffer";
    console.log(req);   // Debugging code
}

// Converts xlsm to json
function xlsm_to_json(req){
    var data = new Uint8Array(req.response);
    var workbook = XLSX.read(data, {type:"array"});

    /* DO SOMETHING WITH workbook HERE */
    // The first sheet is the one with the grades
    // This gets its name
    var grades_sheet_name = workbook.SheetNames[0];

    // Get the grades sheet
    var grades_sheet = workbook.Sheets[grades_sheet_name];

    // Convert sheet to JSON and log it to console
    grades_json = XLSX.utils.sheet_to_json(grades_sheet, {header:1});
    return grades_json;
}


function findHashIndex(hashID, grades){
    for (i = 0; i < grades.length; i++){
        hash = grades[i][0];
        if (hash == hashID){
            return i;
        } else if (typeof hash == 'undefined'){
            return -1;
        }
    }
}

// Generates a table row
function generate_row(grades, rowNum){
    var row = document.createElement("tr");

    for (var item = 0; item <= 28; item++) {
        itemValue = grades[rowNum][item];
        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
        var cell = document.createElement("td");
        if (typeof itemValue != 'undefined'){
            var cellText = document.createTextNode(itemValue);
        } else {
            var cellText = document.createTextNode("");
        }

        cell.appendChild(cellText);
        row.appendChild(cell);
    }

    return row;
}

function update_table(tbl, rows){
    // delete old table
    while(table.hasChildNodes())
    {
        table.removeChild(table.firstChild);
    }

    // create new table body
    var tblBody = document.createElement("tbody");

    // add all of the rows to the body
    for (var r = 0; r < rows.length; r++){
        tblBody.appendChild(rows[r]);
    }

    // add the body to the table
    tbl.appendChild(tblBody);
}

function generate_hash_table_rows(grades, hash_index) {
    // create table body
    var tblBodyElements = [];

    // adds a table row for header
    var headerRow = generate_row(grades, 0);
    tblBodyElements.push(headerRow);

    // adds a table row for hash grades
    var hashScores = generate_row(grades, hash_index);
    tblBodyElements.push(hashScores);

    // creates break between hash grades and class statistics
    tblBodyElements.push(document.createElement("br"));


    // adds class statistics to table
    for (var row = 1; row <= 6; row++){
        // adds a table row for the statistic
        var stats = generate_row(grades, row);
        tblBodyElements.push(stats);
    }

    return tblBodyElements;
}

function generate_all_rows(grades){
    var rows = [];
    var rowNum = 0;

    while(typeof grades[rowNum][0] != "undefined"){
        rows.push(generate_row(grades, rowNum));
        rowNum++;
    }

    return rows;
}

function load_hash_table(grades){
    hash_index = findHashIndex(hashIDinput, grades);
    if (hash_index == -1){
        alert(hashIDinput + " is not a valid hash ID");
    } else {
        // For console debugging
        hash_grades = grades[hash_index];
        console.log(hash_grades);

        // Create table
        table = document.getElementById("HashIDTable");
        hashTableRows = generate_hash_table_rows(grades, hash_index)
        update_table(table, hashTableRows);
    }
}

function load_all_table(grades){
    // Create table
    table = document.getElementById("HashIDTable");
    rows = generate_all_rows(grades)
    update_table(table, rows);
}
