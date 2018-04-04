# [ICS 33 Grade Viewer](http://www.ics.uci.edu/~ccarnaro/ics33gradeviewer.html)
This website allows students in Pattis's [ICS 33](https://www.ics.uci.edu/~pattis/ICS-33/) class to view their grades online.
Simply enter your hashed id and your grades will be displayed.

<html>
    <img src="https://i.imgur.com/5Jug5j3.png" alt="Screenshot of ICS 33 GradeViewer" height="400">
</html>  

### Reusability
This website can easily be reused quarter to quarter.
At the top of [gradeviewer.js](https://github.com/ChaseC99/ICS33-Grade-Viewer/blob/master/js/gradeviewer.js),
there is a section called *Global Variables*.
Under this section, simply change `grades_url` to be the link to the zip file
and `file_name` to be the name of the grades file within the zip.  

### How It Works
When the ICS33 Grade Viewer loads, it downloads the current *Grades* file from the [ICS 33 website](https://www.ics.uci.edu/~pattis/ICS-33/).
The *Grades* file is a zipped .xslm file.
The ICS 33 Grade Viewer unzips this file using the [JSZip](https://stuk.github.io/jszip/) library and then converts it to a JSON object using the [SheetJS](http://sheetjs.com/) library.

Inside of the JSON object, it contains the property referring to the grades (e.g. "Winter 2018").
This property has a two dimensional array, which can be represented as [row[column]].
Rows 0-6 contain data representing statistics for the class.
Starting at row 7, we have data for each hash id.

Within each row list, the information is as follows:

| Index | Value                 |  | Index | Value                  |
| ----- | --------------------- |--| ----- | ---------------------- |
| 0     | Hash ID               |  | 23    | Sum of Midterm & Final |
| 1-8   | Quiz Grades           |  | 24    | Extra Credit Points    |
| 9-14  | Project Grades        |  | 25    | Total Points           |
| 15-16 | In Lab Exam Grades    |  | 26    | Percent Grade          |
| 17-19 | Midterm & Final Grade |  | 27    | Class Rank             |
| 20    | Sum of Quiz Grades    |  | 28    | Letter Grade           |
| 21    | Sum of Project Grades |  | 29    | +/- (for Letter Grade) |
| 22    | Sum of In-Lab Exams   |


These values can easily be changed in the *Global Variables* of `gradeviewer.js` to account for small differences from quarter to quarter.  

If a grade has not yet be inputed, then there is a null.  
After the hash ids, there are a lot of empty lists, which can be ignored.

This data is then put into an HTML table and displayed to the user.

### Contributors
[Chase Carnaroli](https://www.linkedin.com/in/ChaseCarnaroli)  
[Miles Hong](https://www.linkedin.com/in/miles-hong-a74ba3155/)  
[Tristan Jogminas](https://www.linkedin.com/in/tristan-jogminas/)  
