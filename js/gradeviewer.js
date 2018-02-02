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

function generate_table(tbl, grades, hash_index) {
    // create table body
    var tblBody = document.createElement("tbody");

    // adds a table row for header
    var headerRow = generate_row(grades, 0);
    tblBody.appendChild(headerRow);

    // adds a table row for hash grades
    var hashScores = generate_row(grades, hash_index);
    tblBody.appendChild(hashScores);

    // creates break between hash grades and class statistics
    tblBody.appendChild(document.createElement("br"));


    // adds class statistics to table
    for (var row = 1; row <= 6; row++){
        // adds a table row for the statistic
        var stats = generate_row(grades, row);
        tblBody.appendChild(stats);
    }

    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
}
