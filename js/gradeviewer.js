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
