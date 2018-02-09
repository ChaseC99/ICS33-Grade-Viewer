/***************************
    Grades Functions

 The following functions are used to pull data from a grades json file
 ***************************/

// Find HashId Index
//  Finds the index of a hash id in the grades json
//
// Post: returns the index of the hash id, or -1 if its not in the json
function findHashIndex(hashID, grades){
    // Loop through the hash id column
    for (i = 0; i < grades.length; i++){
        hash = grades[i][0];
        if (hash == hashID){
            return i;
        } else if (typeof hash == 'undefined'){
            return -1;
        }
    }
}



/***************************
    Download and Convert XLSM file to JSON

 The following functions are used to download and convert the xlsm
 file into json format.
 ***************************/

// Represent the grades json
// After sendrequest is run the first time, the json is stored here so that it
//  it does not need to be run again (increases efficency)
var grades_json;


// Sends xmlh request
//  After the file loads, it saves the json to grades_json and calls the function
//      which was passed through on grades_json
//
//  Post: sets grades_json and calls the function passed through - func(grades_json)
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
//  Uses SheetJS code to do this
//
//  Post: returns json of the request
function xlsm_to_json(req){
    // Set up and read data from file
    var data = new Uint8Array(req.response);
    var workbook = XLSX.read(data, {type:"array"});

    /* DO SOMETHING WITH workbook HERE */
    // The first sheet is the one with the grades
    // This gets its name
    var grades_sheet_name = workbook.SheetNames[0];

    // Get the grades sheet
    var grades_sheet = workbook.Sheets[grades_sheet_name];

    // Convert sheet to JSON and return it
    grades_json = XLSX.utils.sheet_to_json(grades_sheet, {header:1});
    return grades_json;
}



/***************************
    HTML Table Functions

 The following functions generate HTML tables
 ***************************/

// Generates a table row
//  Given a row number and a json, it will create and return a row from the data
//
//  Post: returns a row element
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


// Updates an existing table
//  Given a table element and a list of rows, this method first deletes everything
//      in the table and then adds each row to it
//
// Post: the table element now contains only the list of rows
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


// Generates the table to display a single hash id
//  First row is the header, describing what each column is
//  Second row is the grades for that hash id
//  Then there is a break
//  Finally the class statistics are displayed
//
//  Post: returns the list of table body elements described above
function generate_hash_table_rows(grades, hash_index) {
    // create table body elements list
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


// Generates the table to display all the grades
//  Shows each row like how it is displayed in the xlsm file
//
//  Post: returns a list of rows for the table
function generate_all_rows(grades){
    var rows = [];
    var rowNum = 0;

    while(typeof grades[rowNum][0] != "undefined"){
        rows.push(generate_row(grades, rowNum));
        rowNum++;
    }

    return rows;
}


// Load the table for hash id
//  This function calls all of the other functions to display the hash id grades
//  It finds the hash id index, determines whether it is valid, gets the table,
//      generates the rows, and updates the table
//
// Post: table is updated to display the hash id grades
function load_hash_table(grades){
    // Get index of the hash id in the input box
    // * I don't like how this uses a global variable, may change later *
    hash_index = findHashIndex(hashIDinput, grades);

    // If hash id isn't in the json, alert the user
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


// Load the table for all grades
//  This functions calls all of the other functions to display all grades
//  It gets the table, generates the rows, and updates the table
//
// Post: table is updated to display all grades
function load_all_table(grades){
    // Create table
    table = document.getElementById("HashIDTable");
    rows = generate_all_rows(grades)
    update_table(table, rows);
}
