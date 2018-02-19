/***************************
    Global Variables

 These global variables can be changed to adapt for slight changes in the xlsm
 file from year to year
 The range for start/end points are inclusive
 ***************************/
// Column Variables
var hashID_column = 0;      // HashID Column

var quiz_start = 1;         // Start column for quiz grades
var quiz_end = 8;           // End column for quiz grades

var project_start = 9;      // Start column for project grades
var project_end = 14;       // End column for project grades

var inLab_start = 15;       // Start column for in lab exam grades
var inLab_end = 16          // End column for in lab grades

var midterm = 17;           // Midterm score
var midterm_u = 18;         // ?
var final = 19;             // Final score

var sum_quizzes = 20;       // Sum of quiz scores
var sum_projects = 21;      // Sum of project scores
var sum_inLab = 22;         // Sum of in lab exam scores
var sum_exams = 23;         // Sum of exam scores (midterm and final)

var extra_credit = 24;      // Number of extra credit points

var total_points = 25;      // Total points
var percent_grade = 26;     // Percent grades
var class_rank = 27;        // Class rank
var letter_grade = 28;      // Letter grade
var plus_minus = 29;        // +/- for letter grade


// Row Variables
var header = 0;              // Name of the column
var total_points = 1;       // Total points for the column
var start_grades = 8;       // Row number for start of grades
var table_length = 29;      // Length of the table
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
        hash = grades[i][hashID_column];
        if (hash == hashID){
            return i;
        } else if (typeof hash == 'undefined'){
            return -1;
        }
    }
}


// Get Score
//  Gets a hash id's score for that specific column
//
//  Post: returns a string "{points} / {total points}"
function getScore(hashIndex, column, grades){
    return grades[hashIndex][column] + " / " + grades[total_points][column].toString();
}


// Convert Score to Percent
//  Converts a string score into a percent by calling the eval method on the str
//      Then multiplies it by 100 and turns it back into a string
//
//  Post: returns a string representing the percent of the score
function scoreToPercent(score){
    return (eval(score) * 100).toString() + '%';
}



/***************************
    Download and Convert XLSM file to JSON

 The following functions are used to download and convert the xlsm
 file into json format.
 ***************************/

// Represent the grades json
//  After sendrequest is run the first time, the json is stored here so that it
//      it does not need to be run again (increases efficency)
var grades_json;


// Sends xmlh request
//  After the file loads, it saves the json to grades_json and calls the function
//      which was passed through on grades_json
//
//  Post: sets grades_json and calls the function passed through - func(grades_json)
function sendrequest(func){
    // THIS CODE LOGS THE JSON OBJECT TO THE CONSOLE
    // Sets xlsm file source as the test file in our GitHub repo
    var url = "https://raw.githubusercontent.com/ChaseC99/ICS33-Grade-Viewer/master/grades.xlsm";

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

// Represents the value withing the hashID input field
var hashIDinput;


// Generates a table row
//  Given a row number and a json, it will create and return a row from the data
//
//  Post: returns a row element
function generate_row(grades, rowNum){
    var row = document.createElement("tr");

    for (var item = 0; item <= table_length; item++) {
        itemValue = grades[rowNum][item];
        // Create <td> element (depending on whether row is the header)
        //  and a text node, make the text node the contents of the <td>,
        //  and put the <td> at the end of the table row
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


// Generates the header row
//  Creates a row header based on what number the header var is
//
//  Post: returns a row element
function generate_header(grades){
    var row = document.createElement('tr');

    for (var item = 0; item <= table_length; item++) {
        itemValue = grades[header][item];
        // Create <th> element (depending on whether row is the header)
        //  and a text node, make the text node the contents of the <th>,
        //  and put the <th> at the end of the table row
        var cell = document.createElement("th");

        if (item == plus_minus){
            var cellText = document.createTextNode("+/-")
        } else if (typeof itemValue != 'undefined'){
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


// Generate Header Rows
//  This generates the header row and the class statistics
//
//  Post: returns a list of rows for the table
function generate_header_rows(grades){
    var rows = [];
    rows.push(generate_header(grades));

    var rowNum = 1;
    while(rowNum < start_grades){
        rows.push(generate_row(grades, rowNum));
        rowNum++;
    }

    return rows;
}


// Generates the table to display all the grades
//  Shows each row like how it is displayed in the xlsm file
//
//  Post: returns a list of rows for the table
function generate_grade_rows(grades){
    var rows = [];

    var rowNum = start_grades;
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

        // Create class statistics table
        table = document.getElementById("HeaderTable");
        rows = generate_header_rows(grades);
        update_table(table, rows);

        // Create table

        table = document.getElementById("GradesTable");
        hashTableRow = [generate_row(grades, hash_index)];
        update_table(table, hashTableRow);
    }
}


// Load the table for all grades
//  This functions calls all of the other functions to display all grades
//  It gets the table, generates the rows, and updates the table
//
// Post: table is updated to display all grades
function load_all_table(grades){
    // Create class statistics table
    table = document.getElementById("HeaderTable");
    rows = generate_header_rows(grades);
    update_table(table, rows);

    // Create grades table
    table = document.getElementById("GradesTable");
    rows = generate_grade_rows(grades);
    update_table(table, rows);
}


// Load Hash Grades Clicked
//  Trigged when enter is hit on the hash id input field
//  Gets the hashID value, determines whether or not it needs to send a request
//      depending on whether or not it already has grades_json, and then calls
//      load_hash_table.
//
//  Post: load_hash_table is called
function loadHashGrades(){
    // Get hashID input
    hashIDinput = document.getElementById("hashID").value;

    // Log hash id to console
    console.log('Hash Id: ' + hashIDinput);

    // Determine whether or not it alread has grades_json
    if (typeof grades_json == 'undefined'){
        // If not, send request and have the request execute load_hash_table
        sendrequest(load_hash_table);
    } else {
        load_hash_table(grades_json);
    }
}


// Load All Grades Clicked
//  Trigged when show all grades button is pressed
//  Determines whether or not it needs to send a request depending on whether or
//      not it already has grades_json, and then calls loadAllGrades
//
//  Post: load_all_table is called
function loadAllGrades(){
    // Determine whether or not it alread has grades_json
    if (typeof grades_json == 'undefined'){
        // If not, send request and have the request execute load_all_table
        sendrequest(load_all_table);
    } else {
        load_all_table(grades_json);
    }
}
