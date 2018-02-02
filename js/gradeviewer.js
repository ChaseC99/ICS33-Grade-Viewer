function findHashIndex(hashID, grades){
    for (i = 0; i < grades.length; i++){
        if (grades[i][0] == hashID){
            return i
        }
    }
}
function generate_table(grades, hash_index) {
    // get the reference for the body
    var table_div = document.getElementById("HashIDTable");

    // creates a <table> element and a <tbody> element
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");


    // creates a table row for header
    var headers = document.createElement("tr");

    for (var item = 0; item <= 28; item++) {
        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
        var cell = document.createElement("td");
        var cellText = document.createTextNode(grades[0][item]);
        cell.appendChild(cellText);
        headers.appendChild(cell);
    }
    tblBody.appendChild(headers);

    // creates a table row for grades
    var scores = document.createElement("tr");
    for (var item = 0; item <= 28; item++) {
        score = grades[hash_index][item]

        // Create a <td> element and a text node, make the text
        // node the contents of the <td>, and put the <td> at
        // the end of the table row
        var cell = document.createElement("td");
        if (typeof score != 'undefined'){
            var cellText = document.createTextNode(score);
        } else {
            var cellText = document.createTextNode("");
        }

        cell.appendChild(cellText);
        scores.appendChild(cell);
    }

    // add the row to the end of the table body
    tblBody.appendChild(scores);


    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
    // appends <table> into <body>
    table_div.appendChild(tbl);
    // sets the border attribute of tbl to 2;
    tbl.setAttribute("border", "2");
}
