function findHashIndex(hashID, grades){
    for (i = 0; i < grades.length; i++){
        if (grades[i][0] == hashID){
            return i
        }
    }
}
function generate_table(grades, hash_index) {
    // get the reference for the body
    var tbl = document.getElementById("HashIDTable");

    // delete old table
    while(tbl.hasChildNodes())
    {
        tbl.removeChild(tbl.firstChild);
    }

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
        score = grades[hash_index][item];

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

    tblBody.appendChild(document.createElement("br"));


    // show class statistics
    for (var row = 1; row <= 6; row++){
        var stats = document.createElement("tr");
        for (var item=0; item <= 28; item++) {
            stat = grades[row][item];

            if (row == 1 && item == 0){
                stat = "Total Points";
            }

            // Create a <td> element and a text node, make the text
            // node the contents of the <td>, and put the <td> at
            // the end of the table row
            var cell = document.createElement("td");
            if (typeof stat != 'undefined'){
                var cellText = document.createTextNode(stat);
            } else {
                var cellText = document.createTextNode("");
            }
            cell.appendChild(cellText);
            stats.appendChild(cell);
        }
        // add the row to the end of the table body
        tblBody.appendChild(stats);
    }




    // put the <tbody> in the <table>
    tbl.appendChild(tblBody);
}
