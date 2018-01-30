# [ICS33 Grade Viewer](https://chasec99.github.io/ICS33-Grade-Viewer/)
This website allows students in Pattis's ICS 33 class to view their grades online.  
While the information on this site should be up-to-date, we cannot guarantee it.
For the most accurate information, please visit the [ICS 33 website](https://www.ics.uci.edu/~pattis/ICS-33/)

### How It Works
When the ICS33 Grade Viewer loads, it downloads the current *Grades* file from the ICS 33 website.
The *Grades* file is a zipped .xslm file.
The ICS 33 Grade Viewer unzips this file and then converts it to a JSON object.

Inside of the JSON object, it contains the property "Winter 2018".
This property has a two dimensional array, which can be represented as [row[column]].  
Rows 0-7 contain data representing statistics for the class.  
Starting at row 8, we have data for each hash id.

Within each row list, the information is as follows:
| Index | Value                 |
| ----- | --------------------- |
| 0     | Hash ID               |
| 1-8   | Quiz Grades           |
| 9-14  | Project Grades        |
| 15-16 | In Lab Exam Grades    |
| 17-19 | EM/EF Grades?         |
| 20    | Sum of Quiz Grades    |
| 21    | Sum of Project Grades |
| 22    | Sum of EP?            |
| 23    | Sum of Exams?         |
| 24    | Extra Credit Points   |
| 25    | Total Points          |
| 26    | Percent Grade         |
| 27    | Class Rank            |
| 28    | Letter Grade          | 


### Contributors
[Chase Carnaroli](https://www.linkedin.com/in/chase-carnaroli-5ba365141/)  
[Tristan Jogminas](https://www.linkedin.com/in/tristan-jogminas/)  
[Miles Hong](https://github.com/wontonlegend)  
